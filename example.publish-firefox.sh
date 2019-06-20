AMO_JWT_ISSUER= user:asdfasdf:asdfa
AMO_JWT_SECRET= asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfsadfasdfasdfasdfasdf
cd build && web-ext sign -a dist-firefox/ -s build/ --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET 