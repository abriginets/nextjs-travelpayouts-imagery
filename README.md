## Project meta

Aviasales (biggest air ticket search website in Russia) has a public API to retrieve airline and location images [pics.avs.io](https://pics.avs.io). The culprit behind that API is that it doesn't utilize some very important caching mechanisms like `stale-while-revalidate` directive and the domain itself is not even behind the CDN which greatly reduces delivery speeds for users far away from Europe. This project aims to solve all those issues by implementing multilayer caching system.

## Avdantages

✔ Supports modern `avif` format for both airlines and location images

✔ Serverless-ready

✔ Supports `stale-while-revalidate` directive

✔ Saves images into Redis to avoid unnecessary upscales and serve them faster

✔ Designed to work behind multiple CDNs

✔ Crops airline image automatically so you don't have to care about precicely calculating image height <sup>\*</sup>

When fetching image from `https://pics.avs.io/200/200/S7.webp` you have a lot of whitespace above and below the logo

<img src="https://pics.avs.io/200/200/S7.webp" alt="S7" />

With nextjs-travelpayouts-imagery you can rely on automated cropping mechanism:

<img src="https://images.flaut.ru/assets/image/airline/regular/200/S7.webp" alt="S7">

## Documentation

### Caching 101

- Specify `REDIS_URL` environment variable in `redis://` connection string format to be able to save airline images into cache and aviod unnecessary HTTP requests API and reduce the response times.
- Put the service behind Netlify or Vercel to stand behind CDN by default
- Optionally put the service behind Cloudflare (recommended) to reduce bandwidth usage and prevent service from accidentally running out of monthly traffic quota and serve images worldwide with minimum delay.

If you enabled Redis caching then the engine would fetch the image in a highest possible resolution and save it to Redis. Then it would only have to grab the image from cache and downscale it to a desired size meaning there is no additional HTTP request to `pics.avs.io`'s image resizer.

### Airline images

Use the following pathnames to fetch airlines images:

```
/assets/image/airline/al_square/256/su.webp
/api/airline/type/al_square/width/256/code/su/extension/webp
```

Available image types are

- `regular`
- `night`
- `al_square`
- `night_square`

Available image format are

- `.png`
- `.webp`
- `.avif`

### Location images

Use the following pathnames to fetch location images:

```
/assets/image/location/1920/1080/su.avif
/location/code/su/width/1920/height/1080/extension/avif
```

Available image format are

- `.jpeg`
- `.webp`
- `.avif`
