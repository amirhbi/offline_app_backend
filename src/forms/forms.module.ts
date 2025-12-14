import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormsController } from './forms.controller.js';
import { FormsService } from './forms.service.js';
import { Form, FormSchema } from './forms.schema.js';
import { EntriesController } from './entries.controller.js';
import { EntriesService } from './entries.service.js';
import { FormEntry, FormEntrySchema } from './entries.schema.js';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Form.name, schema: FormSchema },
    { name: FormEntry.name, schema: FormEntrySchema },
  ])],
  controllers: [FormsController, EntriesController],
  providers: [FormsService, EntriesService],
})
export class FormsModule {}