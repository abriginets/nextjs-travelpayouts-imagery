import axios from 'axios';
import sharp from 'sharp';

import { getRedis } from '../redis/redis.service';
import { LocationImageFormatEnum } from './interfaces/location-image.interface';

export async function fetchLocationImageBuffer(placeIata: string, width: number, height: number): Promise<Buffer> {
  const response = await axios.get<ArrayBuffer>(
    `https://photo.hotellook.com/static/cities/${width}x${height}/${placeIata.toUpperCase()}.webp`,
    {
      responseType: 'arraybuffer',
    },
  );

  return Buffer.from(response.data);
}

export async function locationImageBufferToFormat(buffer: Buffer, format: LocationImageFormatEnum): Promise<Buffer> {
  return await sharp(buffer).toFormat(format, { quality: 100, lossless: true }).toBuffer();
}

export async function getLocationImage(
  placeIata: string,
  width: number,
  height: number,
  format: LocationImageFormatEnum,
) {
  if (process.env.REDIS_URL) {
    const redis = getRedis();
    const cacheKey = `location-image---${placeIata}-${width}-${height}`;
    const cached = await redis.getBuffer(cacheKey);

    if (!cached) {
      const imageBuffer = await fetchLocationImageBuffer(placeIata, width, height);

      await redis.set(cacheKey, imageBuffer);

      return await locationImageBufferToFormat(imageBuffer, format);
    }

    return await locationImageBufferToFormat(cached, format);
  }

  const imageBuffer = await fetchLocationImageBuffer(placeIata, width, height);

  return await locationImageBufferToFormat(imageBuffer, format);
}
