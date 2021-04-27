FILES="$(git ls-files --others --exclude-standard '*.c' '*.h' '*.js')"
echo FILES: $FILES
FILES+=" $(git diff HEAD --name-only '*.c' '*.h' '*.js' | grep -v comlink)"
echo FILES: $FILES
exit 0
if [[ $FILES != " " ]]; then
    echo FILES:::: ${FILES}
    clang-format-6.0 -i -verbose ${FILES}
fi

FILES="$(git ls-files --others --exclude-standard '*.py')"
FILES+=" $(git diff HEAD --name-only '*.py')"
if [[ $FILES != " " ]]; then
    black ${FILES}
fi
