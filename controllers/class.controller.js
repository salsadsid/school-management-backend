import {
  createNewClassService,
  getAllClassesService,
  getClassByIdService,
  updateClassService,
} from "../services/class.service.js";

const createNewClass = async (req, res, next) => {
  try {
    const { name, teacher } = req.body;
    // console.log(name, teacherId);
    const newClass = await createNewClassService({
      name,
      teacher,
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

const updateClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const updateData = req.body;

    const updatedClass = await updateClassService(classId, updateData);

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    next(error);
  }
};

const getClassById = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const classData = await getClassByIdService(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json(classData);
  } catch (error) {
    next(error);
  }
};

export default { createNewClass, getAllClasses, updateClass, getClassById };
