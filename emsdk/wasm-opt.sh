#!/usr/bin/env bash

filtered=()

for arg in "$@"; do
 [[ "$arg" == "--enable-bulk-memory-opt" || "$arg" == "--enable-call-indirect-overlong" || "$arg" == "" ]] && continue
 filtered+=("$arg")
done

exec "${BASH_SOURCE%/*}/wasm-opt_" "${filtered[@]}"