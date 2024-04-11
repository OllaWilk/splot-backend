import { Router } from 'express';
import { TaskRecord } from '../records/task.record';
import { ValidationError } from '../utils/errors';
import { time } from 'console';

export const tasksRouter = Router();

tasksRouter
  .get('/', async (req, res) => {
    const taskRecord = await TaskRecord.getAll();
    res.json({ taskRecord });
  })
  .get('/:id', async (req, res) => {
    const taskId = req.params.id;
    const task = await TaskRecord.getOne(taskId);

    if (!task) {
      throw new ValidationError('There is no such task');
    }

    res.json(task);
  })

  .post('/', async (req, res) => {
    const task = new TaskRecord({
      ...req.body,
      title: req.body.title,
      category: req.body.category,
      priority: req.body.priority,
      description: req.body.description,
    });

    await task.insert();
    res.json(task);
    res.end();
  })

  .post('/:id', async (req, res) => {
    const task = await TaskRecord.getOne(req.params.id);
    const updatedTaskData = {
      title: req.body.title,
      category: req.body.category,
      priority: req.body.priority,
      description: req.body.description,
    };

    if (!task) {
      throw new ValidationError('Task not found');
    }

    await task.update(updatedTaskData);
    res.json(task);
    res.end();
  })

  .delete('/:id', async (req, res) => {
    const task = await TaskRecord.getOne(req.params.id);

    if (!task) {
      throw new ValidationError('No such gift');
    }

    await task.delete();
    res.json(task);
    res.end();
  });
