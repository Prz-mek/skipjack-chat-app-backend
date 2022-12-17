

const errorHandler = (err: any, req: any, res: any, next: any) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode).json({message: err.message});
  }
  
  module.exports = {
    errorHandler
  }