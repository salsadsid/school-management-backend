import {
  createNewClassService,
  getAllClassesService,
} from "../services/class.service.js";

const createNewClass = async (req, res, next) => {
  try {
    const { name, teacherId } = req.body;
    // console.log(name, teacherId);
    const newClass = await createNewClassService({
      name,
      teacher: teacherId,
    });
    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
};

const getAllClasses = async (req, res, next) => {
  try {
    const classes = await getAllClassesService();
    res.status(200).json(classes);
  } catch (error) {
    next(error);
  }
};

export default { createNewClass, getAllClasses };
