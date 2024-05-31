import { ShortNamePipe } from './short-author.pipe';

describe('ShortNamePipe', () => {
  it('create an instance', () => {
    const pipe = new ShortNamePipe();
    expect(pipe).toBeTruthy();
  });
});
