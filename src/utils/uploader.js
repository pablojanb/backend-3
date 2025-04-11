import __dirname from "./index.js";
import multer from 'multer';

const storagePets = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,`${__dirname}/../public/pets`)
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
})

const storageDocs = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,`${__dirname}/../public/documents`)
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
})

export const uploaderPets = multer({storage: storagePets})
export const uploaderDocs = multer({storage: storageDocs})