# make zip file
rm dist # zip file, so no -rf
zip -r dist ./build

# upload new package to the chrome web store
curl \
-H "Authorization: Bearer $ACCESS_TOKEN"  \
-H "x-goog-api-version: 2" \
-X PUT \
-T ./dist.zip \
-v \
https://www.googleapis.com/upload/chromewebstore/v1.1/items/$APP_ID