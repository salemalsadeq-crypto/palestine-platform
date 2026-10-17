PALESTINE PLATFORM — V83

This package is flattened: index.html and all other site files are in the ZIP root.

DEPLOY
1. Download and extract this ZIP.
2. In the GitHub repository, upload/replace the CONTENTS of this folder at the same root where the existing index.html lives. Do not upload the ZIP itself or create an extra palestine-platform-main folder.
3. Commit to the same branch used by GitHub Pages (the screenshot showed main).
4. Wait for Pages build and deployment to succeed, then open the published URL with a cache-busting query such as ?v=83.

The V83 shared CSS is linked from all HTML pages and the shared UI script uses a new cache version. No Supabase schema, keys, or SQL policies were changed. Static checks only; live auth/database behavior was not tested.
