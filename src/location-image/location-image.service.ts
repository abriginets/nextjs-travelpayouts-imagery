import axios from 'axios';
import sharp from 'sharp';

import { LocationImageFormatEnum } from './interfaces/location-image.interface';

export async function getLocationImage(
  placeIata: string,
  width: number,
  height: number,
  format: LocationImageFormatEnum,
) {
  const response = await axios.get<ArrayBuffer>(
    `https://photo.hotellook.com/static/cities/${width}x${height}/${placeIata.toUpperCase()}.webp`,
    {
      responseType: 'arraybuffer',
    },
  );
  const imageBuffer = Buffer.from(response.data);

  return await sharp(imageBuffer).toFormat(format).toBuffer();
}
