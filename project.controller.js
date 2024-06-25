const db = require("./database/connectDB.js");
const formidable = require("formidable");
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const getProjectPath = (id) => {
    const fileName = id.toString() + ".jpg";
    return path.join(__dirname, 'images/projects/', fileName);
}

function getUTCFormattedTimestamp() {
    const dateObj = new Date();
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const hours = String(dateObj.getUTCHours()).padStart(2, '0');
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (UTC)`;
}

const postProject = (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error uploading image');
                return;
            }
            const userId = fields.userId[0];
            const save = fields.save;
            if (userId) {
                const descr = "New Project";
                const timestamp = getUTCFormattedTimestamp();
                const insertProjectQuery =
                    'INSERT INTO project (save, description, user_id, timestamp) VALUES(?, ?, ?, ?)';
                db.query(
                    insertProjectQuery,
                    [save, descr, userId, timestamp],
                    (insertErr, insertResult) => {
                        if (insertErr) {
                            res.status(500).send('Error creating project on server');
                        } else if (insertResult) {
                            const project = { id: insertResult.insertId, description: descr, timestamp: timestamp };
                            res.send(project);
                        }
                    }
                );
            }
        });
    } catch (e) {
        res.status(500).send('Error uploading project');
        return;
    }
}

const getProjects = (req, res) => {
    const userId = req.params.userId;
    const checkProjectsQuery = "SELECT id, save, description, timestamp FROM project WHERE user_id = ?";
    db.query(checkProjectsQuery, [userId], (checkErr, checkResult) => {
        if (checkErr) {
            res.status(500).send("Error checking existing project");
        } else {
            if (checkResult.length === 0) {
                res.status(404).send("No projects saved on server for user");
            } else {
                res.send(checkResult);
            }
        }
    });
}

const getProject = (req, res) => {
    const id = req.params.id;
    const checkProjectsQuery = "SELECT save, description, timestamp FROM project WHERE id = ?";
    db.query(checkProjectsQuery, [id], (checkErr, checkResult) => {
        if (checkErr)
            res.status(500).send("Error checking existing project");
        else {
            if (checkResult.length === 0)
                res.status(404).send("No projects saved on server for user");
            else {
                const result = { ...checkResult[0] };
                result.save = Buffer.from(result.save, 'binary').toString('utf-8');
                res.send(result);
            }
        }
    });
}

const getProjectImageURL = (req, res) => {
    const id = req.params.id;
    const filePath = __dirname + "/images/projects/" + id.toString() + ".png";
    if (fs.existsSync(filePath))
        res.sendFile(filePath);
    else
        res.status(404).send('File not found');
}

const deleteProject = (req, res) => {
    const id = req.params.id;
    const filePath = __dirname + "/images/projects/" + id.toString() + ".jpg";
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }
        })
    }
    const deleteProjectQuery = "DELETE FROM project WHERE id = (?)";
    db.query(deleteProjectQuery, [id], (checkErr, checkResult) => {
        if (checkErr) {
            res.status(500).send("Error deleting project from database");
            return;
        } else if (checkResult) {
            res.sendStatus(204);
            return;
        }
    });
}

const putProject = (req, res) => {
    try {
        const id = req.params.id;
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error uploading image');
                return;
            }
            const save = fields.save;
            const descr = fields.description;
            const timestamp = getUTCFormattedTimestamp();
            if (id) {
                const insertProjectQuery =
                    'UPDATE project SET save = (?), description = (?), timestamp = (?) WHERE id = (?)';
                db.query(
                    insertProjectQuery,
                    [save, descr, timestamp, id],
                    (insertErr, insertResult) => {
                        if (insertErr)
                            res.status(500).send('Error creating image on server');
                        else if (insertResult) {
                            const file = files.file[0];
                            const oldPath = file.filepath;
                            const newPath = path.join(__dirname, 'images/projects', file.originalFilename);
                            const rawData = fs.readFileSync(oldPath);
                            fs.writeFile(newPath, rawData, (err) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send('Error uploading project');
                                } else {
                                    res.send({ timestamp })
                                }
                            });
                        }
                    }
                );
            }
        });
    } catch (e) {
        res.status(500).send('Error uploading project');
        return;
    }
}


module.exports = { postProject, getProject, getProjects, getProjectImageURL, deleteProject, putProject };