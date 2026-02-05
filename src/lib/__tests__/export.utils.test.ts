import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadBlob } from '../export.utils';

describe('export.utils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('downloadBlob', () => {
    it('should create a download link and trigger download', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test-file.txt';

      // Mock URL methods
      const mockObjectURL = 'blob:http://localhost:3000/test';
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectURL);
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      // Mock document methods
      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
      } as unknown as HTMLAnchorElement;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);

      await downloadBlob(mockBlob, filename);

      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe(mockObjectURL);
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', filename);
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockObjectURL);
    });

    it('should handle different file types', async () => {
      const mockBlob = new Blob(['{"data": "test"}'], { type: 'application/json' });
      const filename = 'data.json';

      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);

      await downloadBlob(mockBlob, filename);

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'data.json');
    });
  });
});
