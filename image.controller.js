const db = require("./database/connectDB.js");
const formidable = require("formidable");
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const getImagePath = (id, imageName) => {
    const suffixPos = imageName.lastIndexOf(".");
    let suffix = ".jpg";
    if (suffixPos >= 0)
        suffix = imageName.substring(suffixPos);
    const fileName = id.toString() + suffix;
    return path.join(__dirname, 'images', fileName);
}

const postImage = (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error uploading image');
                return;
            }
            const userId = fields.userId[0];
            if (userId) {
                const imageFile = files.image[0];
                let imageName = imageFile.originalFilename;
                const insertImageQuery =
                    'INSERT INTO image (name, user_id) VALUES (?, ?)';
                db.query(
                    insertImageQuery,
                    [imageName, userId],
                    (insertErr, insertResult) => {
                        if (insertErr) {
                            res.status(500).send('Error creating image on server');
                        } else {
                            const imagePath = getImagePath(insertResult.insertId, imageName);
                            fs.copyFile(imageFile.filepath, imagePath, (err) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send('Error uploading image');
                                } else {
                                    res.status(200).send("Image uploaded successfully");
                                }
                            });
                        }
                    }
                );
            }
        });
    } catch (e) {
        res.status(500).send('Error uploading image');
        return;
    }
}

const getImages = (req, res) => {
    const userId = req.params.userId;
    const checkImagesQuery = "SELECT id, name FROM image WHERE user_id = ?";
    db.query(checkImagesQuery, [userId], (checkErr, checkResult) => {
        if (checkErr) {
            res.status(500).send("Error checking existing image");
        } else {
            if (checkResult.length === 0) {
                res.status(404).send("No images saved on server for this user");
            } else {
                res.send(checkResult);
            }
        }
    });
}

const getImageURL = (req, res) => {
    const id = req.params.id;
    const filePath = __dirname + "/images/";
    const files = glob.sync(filePath + id + '.*');
    if (files.length) {
        res.sendFile(files[0]);
    } else {
        res.status(404).send('File not found');
        return;
    }
}

const deleteImage = (req, res) => {
    const id = req.params.id;
    const filePath = __dirname + "/images/";
    const files = glob.sync(filePath + id + '.*');
    if (files.length) {
        fs.unlink(files[0], (err) => {
            if (err) {
                res.status(500).send('Internal server error deleting image');
                return;
            }
        })
    }
    const deleteImageQuery = "DELETE FROM image WHERE id = (?)";
    db.query(deleteImageQuery, [id], (checkErr, checkResult) => {
        if (checkErr) {
            res.status(500).send("Error deleting image from database");
            return;
        } else if (checkResult) {
            res.sendStatus(204);
            return;
        }
    });
}

const renameImage = (req, res) => {
    const id = req.params.id;
    let newName = req.params.newFileName;
    const posSuffix = newName.lastIndexOf(".");
    let newImageSuffix = ".jpg";
    if (posSuffix >= 0) {
        const suffix = newName.substring(posSuffix);
        if (suffix === ".png" || suffix === ".jpg")
            newImageSuffix = suffix;
        newName = newName.substring(0, posSuffix) + newImageSuffix;
    }
    else
        newName += newImageSuffix;

    const updateImagesQuery = "UPDATE image SET name=(?) WHERE id=(?)";
    db.query(updateImagesQuery, [newName, id], (checkErr, checkResult) => {
        if (checkErr) {
            res.status(500).send('Unable to update image name');
        } else if (checkResult) {
            const newImageName = getImagePath(id, newName)
            const filePath = __dirname + "/images/";
            const files = glob.sync(filePath + id + '.*');
            if (files.length)
                fs.renameSync(files[0], newImageName);
            res.send('File renamed successfully');
        }
    });
};

module.exports = { postImage, getImages, getImageURL, deleteImage, renameImage };
