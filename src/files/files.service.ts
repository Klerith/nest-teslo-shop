import { existsSync } from 'fs';
import { join } from 'path';

import { Injectable, BadRequestException } from '@nestjs/common';


@Injectable()
export class FilesService {
  
    getStaticProductImage( imageName: string ) {

        const path = join( __dirname, '../../static/products', imageName );

        if ( !existsSync(path) ) 
            throw new BadRequestException(`No product found with image ${ imageName }`);

        return path;
    }


}
