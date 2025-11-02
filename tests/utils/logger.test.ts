import { Logger } from '../../src/utils/logger';

// Mock console methods
const mockLog = jest.spyOn(console, 'log').mockImplementation();
const mockError = jest.spyOn(console, 'error').mockImplementation();

describe('Logger', () => {
  beforeEach(() => {
    mockLog.mockClear();
    mockError.mockClear();
  });

  afterAll(() => {
    mockLog.mockRestore();
    mockError.mockRestore();
  });

  it('should log info messages', () => {
    Logger.info('Test info message');
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Test info message'));
  });

  it('should log success messages', () => {
    Logger.success('Test success message');
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Test success message'));
  });

  it('should log error messages', () => {
    Logger.error('Test error message');
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Test error message'));
  });

  it('should log warning messages', () => {
    Logger.warning('Test warning message');
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Test warning message'));
  });

  it('should respect color output setting', () => {
    Logger.setColorOutput(false);
    Logger.info('Test message');
    expect(mockLog).toHaveBeenCalledWith('ℹ Test message');
    
    Logger.setColorOutput(true);
  });
});
