import { NgModule } from '@angular/core';
import { TrimNamePipe } from './trim-name/trim-name';
@NgModule({
	declarations: [TrimNamePipe],
	imports: [],
	exports: [TrimNamePipe]
})
export class PipesModule {}
