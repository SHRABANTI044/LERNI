import { TextDecoder, TextEncoder } from 'util';
import { sendTutorMessage } from './aiTutorApi';

describe('AI Tutor streamed chat', () => {
  const originalTextDecoder = global.TextDecoder;
  const originalTextEncoder = global.TextEncoder;

  beforeAll(() => {
    global.TextDecoder = TextDecoder;
    global.TextEncoder = TextEncoder;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    global.TextDecoder = originalTextDecoder;
    global.TextEncoder = originalTextEncoder;
  });

  test('delivers text chunks as they arrive and returns the completed conversation', async () => {
    const chunks = [
      '{"type":"delta","text":"Photosynthesis "}\n',
      '{"type":"delta","text":"uses light."}\n{"type":"done","reply":"Photosynthesis uses light.","conversationId":"chat-1"}\n',
    ];
    const read = jest.fn()
      .mockImplementationOnce(async () => ({ done: false, value: new TextEncoder().encode(chunks[0]) }))
      .mockImplementationOnce(async () => ({ done: false, value: new TextEncoder().encode(chunks[1]) }))
      .mockImplementationOnce(async () => ({ done: true, value: undefined }));
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      body: { getReader: () => ({ read }) },
    });
    const onDelta = jest.fn();

    const result = await sendTutorMessage({
      message: 'Explain photosynthesis',
      onDelta,
    });

    expect(onDelta.mock.calls).toEqual([['Photosynthesis '], ['uses light.']]);
    expect(result).toEqual({
      reply: 'Photosynthesis uses light.',
      conversationId: 'chat-1',
    });
  });

  test('surfaces errors received after a stream has started', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('{"type":"error","message":"Please retry shortly."}\n'),
            }),
        }),
      },
    });

    await expect(sendTutorMessage({ message: 'Help me study' }))
      .rejects.toThrow('Please retry shortly.');
  });
});
