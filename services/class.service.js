import Class from "../models/Class.js";

export const getAllClassesService = async () => {
  try {
    const classes = await Class.find()
      .populate({ path: "teacher", select: "-password" })
      .populate({
        path: "students",
        select: "-password",
      });
    return classes;
  } catch (error) {
    throw new Error("Error finding classes");
  }
};

export const createNewClassService = async (classData) => {
  try {
    // console.log(classData);
    const newClass = await Class.create(classData);
    return newClass;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating class");
  }
};

export const addStudentToClassService = async (studentId, classId) => {
  try {
    await Class.updateOne({ _id: classId }, { $push: { students: studentId } });
    const updatedClass = await Class.findById(classId).populate({
      path: "students",
      select: "-password",
    });
    return updatedClass;
  } catch (error) {
    console.log(error);
    throw new Error("Error adding student to class");
  }
};
