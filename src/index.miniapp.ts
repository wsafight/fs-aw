import { asserAbsolutePath } from "./utils";
import { EncodingType } from './index';
import { getCurrentFactory } from "./utils/miniapp-factory";

interface Factory {
    getFileSystemManager(): FileSystemManager;
}

interface FileSystemManager {
    access(options: any): void;
    appendFile(options: any): void;
    copyFile(options: any): void;
    getFileInfo(options: any): void;
    getSavedFileList(options: any): void;
    getSavedFileInfo(options: any): void;
    mkdir(options: any): void;
    readdir(options: any): void;
    readFile(options: any): void;
    rename(options: any): void;
    writeFile(options: any): void;
    rmdir(options: any): void;
    saveFile(options: any): void;
    stat(options: any): void;
    unlink(options: any): void;
}

let [factory, BASE_URL]: [Factory, string] = getCurrentFactory();

export const initFactory = (f: Factory, baseUrl: string) => {
    factory = f;
    BASE_URL = baseUrl;
};

const getFileSystemManager = () => {
    if (!factory?.getFileSystemManager) {
        throw new Error('Not support miniapp platform, please use initFactory to init.');
    }
    return factory.getFileSystemManager();
}
const getFullName = (fileName: string) => BASE_URL + fileName;

const readFile = async (fileName: string, encoding?: EncodingType) => {
    asserAbsolutePath(fileName);
    const fs = getFileSystemManager();
    return new Promise((resolve, fail) => {
        fs.readFile({
            filePath: getFullName(fileName),
            encoding,
            success: (res) => {
                resolve(res.data);
            },
            fail,
        });
    });
}

const writeFile = async (fileName: string, data: any): Promise<boolean> => {
    asserAbsolutePath(fileName);
    const fs = getFileSystemManager();
    if (!(data instanceof ArrayBuffer)) {
        data = String(data);
    }
    return new Promise((resolve, fail) => {
        fs.writeFile({
            filePath: getFullName(fileName),
            data,
            success: () => {
                resolve(true);
            },
            fail,
        });
    });
}

const removeFile = async (fileName: string): Promise<boolean> => {
    asserAbsolutePath(fileName);
    const fs = getFileSystemManager();
    return new Promise((resolve, fail) => {
        fs.unlink({
            filePath: getFullName(fileName),
            success: () => {
                resolve(true);
            },
            fail,
        });
    });
}

declare interface readdir {
    (dirName: string, options: { withFileTypes: true }): Promise<{ isDirectory(): boolean; isFile(): boolean } []>;
    (dirName: string): Promise<string []>; 
}
const readdir = async (dirName: string, options?: { withFileTypes: boolean }) => {
    asserAbsolutePath(dirName);
    const fs = getFileSystemManager();
    if (options?.withFileTypes) {
        return new Promise((resolve, fail) => {
            fs.stat({
                path: getFullName(dirName),
                recursive: true,
                success: res => {
                    const fileList = Object.keys(res.stats)
                    // filter self
                    .filter((itemPath) => itemPath !== '/')
                    .map((itemPath) => {
                        const item = res.stats[itemPath];
                        return {
                            path: itemPath,
                            isDirectory: item?.isDirectory.bind(item),
                            isFile: item?.isFile.bind(item),
                        }
                    });
                    resolve(fileList);
                },
                fail,
            })
        })
    }

    return new Promise((resolve, fail) => {
        fs.readdir({
            dirPath: getFullName(dirName),
            success: async (res) => {
                resolve(res.files);
            },
            fail,
        });
    });
}

const mkdir = async (dirName: string): Promise<boolean> => {
    asserAbsolutePath(dirName);
    const fs = getFileSystemManager();
    return new Promise((resolve, fail) => {
        fs.mkdir({
            dirPath: getFullName(dirName),
            // default recursive
            recursive: true,
            success: () => {
                resolve(true);
            },
            fail,
        });
    });
}

const rmdir = async (dirName: string): Promise<boolean> => {
    asserAbsolutePath(dirName);
    const fs = getFileSystemManager();
    return new Promise((resolve, fail) => {
        fs.rmdir({
            dirPath: getFullName(dirName),
            recursive: true,
            success: () => {
                resolve(true);
            },
            fail,
        });
    });
}

const exists = async (fileName: string): Promise<boolean> => {
    asserAbsolutePath(fileName);
    const fs = getFileSystemManager();
    return new Promise((resolve) => {
        fs.access({
            path: getFullName(fileName),
            success: () => {
                resolve(true);
            },
            fail: () => {
                resolve(false);
            },
        });
    });
}

const stat = async (fileName: string): Promise<any> => {
    asserAbsolutePath(fileName);
    const fs = getFileSystemManager();
    return new Promise((resolve, fail) => {
        fs.stat({
            path: getFullName(fileName),
            success: (res) => {
                resolve(res);
            },
            fail,
        });
    });
}



export {
    readFile,
    writeFile,
    removeFile,
    readdir,
    mkdir,
    rmdir,
    exists,
    stat,
};