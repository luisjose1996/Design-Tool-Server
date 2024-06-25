const express = require("express");

const { signup, login } = require("./user.controller.js");
const { postImage, getImages, getImageURL, deleteImage, renameImage } = require("./image.controller.js");
const { postProject, getProject, getProjects, getProjectImageURL, deleteProject, putProject } = require("./project.controller.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post('/image', postImage);
router.get('/images/:userId', getImages);
router.get('/image/:id', getImageURL);
router.delete('/image/:id', deleteImage);
router.put('/image/rename/:id/:newFileName', renameImage);

router.post('/project', postProject);
router.get('/project/:id', getProject)
router.get('/projects/:userId', getProjects);
router.get('/project/image/:id', getProjectImageURL);
router.delete('/project/:id', deleteProject);
router.put('/project/save/:id', putProject);

module.exports = router;
