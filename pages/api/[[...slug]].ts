import {
  createHandler,
  Get,
  Param,
  ParseNumberPipe,
  Res,
  SetHeader,
  ValidateEnumPipe,
} from '@storyofams/next-api-decorators';
import mime from 'mime-types';
import type { NextApiResponse } from 'next';

import { getResizedAirlineImage } from '../../src/airline-image/airline-image.service';
import {
  AirlineImageFormatEnum,
  AirlineImageTypesEnum,
} from '../../src/airline-image/interfaces/airline-image.interface';
import { LocationImageFormatEnum } from '../../src/location-image/interfaces/location-image.interface';
import { getLocationImage } from '../../src/location-image/location-image.service';

class ImageController {
  @Get('/airline/type/:type/width/:width/code/:code/extension/:extension')
  @SetHeader('Content-Disposition', 'inline')
  @SetHeader('Cache-Control', `s-maxage=${86400 * 7}, stale-while-revalidate=${86400 * 30}`)
  @SetHeader('Cloudflare-CDN-Cache-Control', `s-maxage=${86400 * 7}, stale-while-revalidate=${86400 * 30}`)
  async getAirlineImage(
    @Param('type', ValidateEnumPipe({ type: AirlineImageTypesEnum })) type: AirlineImageTypesEnum,
    @Param('width', ParseNumberPipe) width: number,
    @Param('code') code: string,
    @Param('extension', ValidateEnumPipe({ type: AirlineImageFormatEnum })) extension: AirlineImageFormatEnum,
    @Res() response: NextApiResponse,
  ): Promise<void> {
    const imageBuffer = await getResizedAirlineImage(type, width, code, extension);

    response.setHeader('Content-Type', mime.contentType(extension) as string);

    return response.send(imageBuffer);
  }

  @Get('/location/code/:iata/width/:width/height/:height/extension/:extension')
  @SetHeader('Content-Disposition', 'inline')
  @SetHeader('Cache-Control', `s-maxage=${86400 * 7}, stale-while-revalidate=${86400 * 30}`)
  @SetHeader('Cloudflare-CDN-Cache-Control', `s-maxage=${86400 * 7}, stale-while-revalidate=${86400 * 30}`)
  async getLocationImage(
    @Param('iata') code: string,
    @Param('width', ParseNumberPipe) width: number,
    @Param('height', ParseNumberPipe) height: number,
    @Param('extension', ValidateEnumPipe({ type: LocationImageFormatEnum })) extension: LocationImageFormatEnum,
    @Res() response: NextApiResponse,
  ): Promise<void> {
    const imageBuffer = await getLocationImage(code, width, height, extension);

    response.setHeader('Content-Type', mime.contentType(extension) as string);

    return response.send(imageBuffer);
  }
}

export default createHandler(ImageController);
