import axios from 'axios';
import sharp from 'sharp';

import { getRedis } from '../redis/redis.service';
import { AirlineImageFormatEnum, AirlineImageTypesEnum } from './interfaces/airline-image.interface';

export async function fetchImageBuffer(airlineIata: string, urlType: AirlineImageTypesEnum): Promise<Buffer> {
  const type = urlType === AirlineImageTypesEnum.REGULAR ? '' : `${urlType}/`;
  const image = await axios.get<ArrayBuffer>(
    `https://pics.avs.io/${type}/500/500/${airlineIata.toUpperCase()}@2x.png`,
    {
      responseType: 'arraybuffer',
    },
  );

  return Buffer.from(image.data);
}

export async function fetchImage(airlineIata: string, urlType: AirlineImageTypesEnum): Promise<Buffer> {
  if (process.env.REDIS_URL) {
    const redis = getRedis();
    const cacheKey = `airline-image---${airlineIata}-${urlType}`;
    const cached = await redis.getBuffer(cacheKey);

    if (!cached) {
      const imageBuffer = await fetchImageBuffer(airlineIata, urlType);

      await redis.set(cacheKey, imageBuffer, 'EX', 86400);

      return imageBuffer;
    }

    return cached;
  }

  return await fetchImageBuffer(airlineIata, urlType);
}

export async function getResizedAirlineImage(
  type: AirlineImageTypesEnum,
  width: number,
  iata: string,
  format: AirlineImageFormatEnum,
): Promise<Buffer> {
  const imageBuffer = await fetchImage(iata, type);
  const isImageSquare = type === AirlineImageTypesEnum.AL_SQUARE || type === AirlineImageTypesEnum.NIGHT_SQUARE;

  // just give back the original image without processing
  if (isImageSquare && width === 1000) {
    return imageBuffer;
  }

  const image = sharp(imageBuffer)
    .resize({
      width,
      height: isImageSquare ? width : Math.round(width / 4),
      fit: sharp.fit.contain,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: width > 1000 ? 'nearest' : 'lanczos3',
    })
    .toFormat(format, { quality: 100 });

  if (isImageSquare) {
    return await image.toBuffer();
  }

  return await image.trim(5).toBuffer();
}
