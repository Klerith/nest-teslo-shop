export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function,
) => {
  // console.log({ file })
  if (!file) return callback(new Error('File is empty'), false);

  const fileException = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  if (validExtensions.includes(fileException)) {
    return callback(null, true);
  }

  callback(null, false);
};
