// Add this to the top of your goalService.ts file
export type ErrorResponse = {
    status: number;
    statusText: string;
    data: any;
  };
  