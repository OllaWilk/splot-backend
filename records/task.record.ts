import { FieldPacket } from 'mysql2';
import { v4 as uuid } from 'uuid';
import { Category, CreateTaskReq, Priority, TaskEntity } from '../types';
import { pool } from '../utils/db';
import { ValidationError } from '../utils/errors';

type TaskRecordResults = [TaskRecord[], FieldPacket[]];

export class TaskRecord implements TaskEntity {
  public id?: string;
  public time: Date;
  public title: string;
  public category: Category;
  public priority?: Priority;
  public description?: string;

  constructor(obj: TaskEntity) {
    const { id, time, title, category, priority, description } = obj;

    this.id = id ?? uuid();
    this.time = time ?? new Date();
    this.title = title;
    this.category = category;
    this.priority = priority;
    this.description = description;

    if (!obj.title) {
      throw new ValidationError(
        'Title of the task cannot be empty or exceed 100 characters.'
      );
    }

    if (obj.description.length > 1000) {
      throw new ValidationError(
        'The description cannot be exceed 1000 characters.'
      );
    }
  }

  static async getAll(): Promise<TaskRecord[]> {
    const [results] = (await pool.execute(
      'SELECT * FROM `tasks`'
    )) as TaskRecordResults;

    return results.map((obj) => new TaskRecord(obj));
  }

  static async getOne(id: string): Promise<TaskRecord | null> {
    const [results] = (await pool.execute(
      'SELECT * FROM `tasks` WHERE `id` = :id',
      {
        id,
      }
    )) as TaskRecordResults;

    return results.length === 0 ? null : new TaskRecord(results[0]);
  }

  async insert(): Promise<void> {
    await pool.execute(
      'INSERT INTO `tasks` (`id`, `time`, `title`, `category`, `priority`, `description`) VALUES (:id, :time, :title, :category, :priority, :description)',
      {
        id: this.id,
        time: this.time,
        title: this.title,
        category: this.category,
        priority: this.priority,
        description: this.description,
      }
    );
  }

  async update(updatedTaskData: CreateTaskReq): Promise<void> {
    await pool.execute(
      'UPDATE `tasks` SET `title` = :title , `category` = :category , `priority` = :priority , `description` = :description  WHERE `id` = :id',
      {
        id: this.id,
        ...updatedTaskData,
      }
    );
  }

  async delete(): Promise<void> {
    await pool.execute(' DELETE FROM `tasks` WHERE `id` = :id', {
      id: this.id,
    });
  }
}
