import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Survey, SurveySharedUser } from ".";

@ObjectType()
@Entity({ name: 'users' })
class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column()
  password!: string;

  @OneToMany(() => Survey, survey => survey.user)
  surveys: Survey[];

  @OneToMany(() => SurveySharedUser, surveyShare => surveyShare.user)
  surveyShares: SurveySharedUser[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

export default User;