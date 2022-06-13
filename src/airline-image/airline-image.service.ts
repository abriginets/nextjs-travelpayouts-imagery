import axios from 'axios';
import sharp from 'sharp';

import { AirlineImageFormatEnum, AirlineImageTypesEnum } from './interfaces/airline-image.interface';

export async function fetchImage(airlineIata: string, urlType: AirlineImageTypesEnum): Promise<Buffer> {
  const type = urlType === AirlineImageTypesEnum.REGULAR ? '' : `${urlType}/`;
  const image = await axios.get<ArrayBuffer>(`https://pics.avs.io/${type}/1000/1000/${airlineIata.toUpperCase()}.png`, {
    responseType: 'arraybuffer',
  });

  return Buffer.from(image.data);
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
