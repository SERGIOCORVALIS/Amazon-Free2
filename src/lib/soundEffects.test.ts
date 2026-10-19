import test from 'node:test';
import assert from 'node:assert/strict';
import { soundEffects } from './soundEffects.ts';

test('soundEffects engine toggles mute state accurately', () => {
  soundEffects.setMuted(true);
  assert.equal(soundEffects.getMuted(), true);

  soundEffects.setMuted(false);
  assert.equal(soundEffects.getMuted(), false);
});

test('soundEffects handles headless environment gracefully without errors', () => {
  // In Node environment without window.AudioContext, calls must not throw
  assert.doesNotThrow(() => {
    soundEffects.playAlexaChime();
    soundEffects.playRingDoorbellChime();
    soundEffects.playSmartLockSound(true);
    soundEffects.playRemoteClick();
    soundEffects.playHeartbeatSound();
  });
});
