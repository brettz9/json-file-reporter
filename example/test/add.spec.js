import assert from 'node:assert';
import add from '../src/add.js';

describe('add()', () => {
  it('should return sum', () => {
    const sum = add(1, 2);
    assert.strictEqual(sum, 3);
  });
});
