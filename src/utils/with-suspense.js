import * as React from 'react'
// import { shallowEqualArrays } from "shallow-equal";
import { EventEmitter } from 'events'

/**
 * @typedef Deps
 * @type {unknown[] | null}
 *
 * @typedef Deferred
 * @type {
 *  | { $promise: Promise<any>, listeners: number }
 *  | { $fullfilled?: any, listeners: number }
 *  | { $rejected?: Error, listeners: number }
 * }
 */

let suspense_fetch = ({ cache, key, executeFn, argument }) => {
	cache.set(key, {
		listeners: 0,
		$promise: (async () => {
			try {
				let result = await executeFn(argument)
				cache.set(key, {
					$fullfilled: result,
					listeners: cache.get(key).listeners,
				})
			} catch (error) {
				cache.set(key, {
					$rejected: error,
					listeners: cache.get(key).listeners,
				})
			} finally {
				// TODO Enable this when it actually helps
				// setTimeout(() => {
				//   if (cache.get(key).listeners === 0) {
				//     cache.delete(key);
				//   }
				// }, 10 * 1000);
			}
		})(),
	})
}

/**
 * @function
 * @template Input
 * @template Output
 * @template Key
 * @param {(input: Input) => Key} keyMapFn
 * @param {(input: Input) => Promise<Output>} executeFn
 * @param {Map<Key, Deferred>} cache
 * @returns {((input: Input) => Output) & { refetch: (input: Input, value: Output) => Promise<void> }}
 */
export let withSuspense = (keyMapFn, executeFn, cache = new Map()) => {
	let suspense_events = new EventEmitter()
	// suspense_events.setMaxListeners(Infinity);
	suspense_events.setMaxListeners(100)

	/** @type {(input: Input) => Output} */
	let useSuspense = (argument) => {
		let key = keyMapFn(argument)
		// eslint-disable-next-line no-unused-vars
		let [_, update_refetch_value] = React.useState(0)
		React.useEffect(() => {
			let handler = (updated_key) => {
				if (updated_key === key) {
					update_refetch_value(Math.random())
				}
			}
			suspense_events.on('refetch', handler)
			return () => {
				suspense_events.off('refetch', handler)
			}
		}, [key])

		// TODO Add deps so you can refetch
		if (!cache.has(key)) {
			suspense_fetch({
				cache: cache,
				key: key,
				executeFn: executeFn,
				argument: argument,
			})
		}
		let connection = cache.get(key)

		React.useEffect(() => {
			cache.set(key, {
				...cache.get(key),
				listeners: cache.get(key).listeners + 1,
			})
			return () => {
				cache.set(key, {
					...cache.get(key),
					listeners: cache.get(key).listeners - 1,
				})
			}
		}, [key])

		if ('$promise' in connection) {
			throw connection.$promise
		}
		if ('$fullfilled' in connection) {
			return connection.$fullfilled
		}
		if ('$rejected' in connection) {
			throw connection.$rejected
		}
	}

	Object.assign(useSuspense, {
		refetch: async (argument, result) => {
			let key = keyMapFn(argument)
			cache.set(key, {
				$fullfilled: result,
				listeners:
					cache.get(key) == null || cache.get(key).listeners == null
						? []
						: cache.get(key).listeners,
			})
			suspense_events.emit('refetch', key)
		},
	})

	// @ts-ignore
	return useSuspense
}
