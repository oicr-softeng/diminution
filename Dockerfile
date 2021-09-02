FROM node AS prebuilder

WORKDIR /app
COPY src/ /app/src/
COPY \
    .babelrc.js \
    package.json \
    yarn.lock \
    /app/

RUN \
    yarn install && \
    yarn build

# ***********************
# jettison the prebuilder

FROM node:slim as runtime
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN \
    sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get -y upgrade && \
    apt-get install -y bash-completion vim && \
    apt-get clean

WORKDIR /srv/diminution
COPY --from=prebuilder\
    /app/node_modules/\
    ./node_modules/

COPY --from=prebuilder\
    /app/dist/\
    ./dist/

COPY --from=prebuilder\
    /app/src/views/\
    ./dist/views/

COPY --from=prebuilder\
    /app/src/favicon.ico\
    ./dist/

COPY --from=prebuilder\
    /app/package.json\
    ./

EXPOSE 4100
CMD [ "node", "dist/index.js" ]
