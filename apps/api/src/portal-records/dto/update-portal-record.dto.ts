import { PartialType } from '@nestjs/mapped-types';
import { CreatePortalRecordDto } from './create-portal-record.dto';

export class UpdatePortalRecordDto extends PartialType(CreatePortalRecordDto) {}
