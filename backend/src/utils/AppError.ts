// Erro de negócio com status HTTP. Ex.: new AppError(409, 'Suíte ocupada').
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
