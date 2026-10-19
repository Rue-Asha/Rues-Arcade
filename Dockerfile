# Context is the extracted release tarball (see .github/workflows/release.yml), not the source tree.
FROM node:22-slim

ENV NODE_ENV=production \
	HOST=0.0.0.0 \
	PORT=3000 \
	DATABASE_PATH=/data/rues-arcade.db

WORKDIR /app
COPY --chown=node:node . .
RUN mkdir /data && chown node:node /data

USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
	CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "build"]
