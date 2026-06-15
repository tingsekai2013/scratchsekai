(function(Scratch) {
    'use strict';

    let startTime = Date.now();
    let hasFired45 = false; // Tracks if the 4.5-second event has already played

    class RhythmTimerExtension {
        getInfo() {
            return {
                id: 'rhythmtimer',
                name: 'Rhythm Timer',
                blocks: [
                    {
                        opcode: 'getMusicTimer',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'music timer'
                    },
                    {
                        opcode: 'resetMusicTimer',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset music timer'
                    },
                    {
                        opcode: 'whenMusicTimerHits45',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when music timer hits 4.5s',
                        isEdgeActivated: true
                    }
                ]
            };
        }

        getMusicTimer() {
            return (Date.now() - startTime) / 1000;
        }

        resetMusicTimer() {
            startTime = Date.now();
            hasFired45 = false; // Reset the trigger so it can happen again next song/attempt
        }

        // This checks every frame. The moment it crosses 4.5, it fires ONCE.
        whenMusicTimerHits45() {
            if (!hasFired45 && this.getMusicTimer() >= 4.5) {
                hasFired45 = true; // Instantly lock it so it doesn't repeat
                return true; // Fires the hat block
            }
            return false;
        }
    }

    Scratch.extensions.register(new RhythmTimerExtension());
})(Scratch);
