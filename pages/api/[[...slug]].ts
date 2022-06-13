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

class ImageController {
  @Get('/airline/type/:type/width/:width/code/:code/extension/:extension')
  @SetHeader('Content-Disposition', 'inline')
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
}

export default createHandler(ImageController);
