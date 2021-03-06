import { Question, SurveySharedUser, User } from '.';
import { PrivacyTypes } from "../enums";
import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import SurveyShare from './SurveyShare';

@ObjectType()
@Entity({ name: 'surveys' })
class Survey extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  title!: string;

  @Column()
  description: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User, user => user.surveys)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  privacy_type: PrivacyTypes;

  @Column()
  draft: boolean;

  @OneToOne(() => SurveyShare, shareDetails => shareDetails.survey)
  shareDetails: SurveyShare;

  @OneToOne(() => SurveySharedUser, sharedUser => sharedUser.survey)
  sharedUsers: SurveySharedUser;

  @OneToMany(() => Question, question => question.survey)
  questions: Question[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Survey;