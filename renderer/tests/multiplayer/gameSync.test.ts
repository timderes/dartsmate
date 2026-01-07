import { describe, it, expect } from 'vitest';
import { gameReducer } from '../../hooks/useDartGame';
import { APP_VERSION } from '../../utils/constants';
import { GameState, GameAction } from '../../types/GameState';
import { Match, Player } from '../../types/match';

// --- Mock Data Setup ---

const createMockPlayer = (id: string, name: string): Player => ({
  uuid: id,
  name: name,
  username: name,
  email: `${name}@test.com`,
  avatarImage: null,
  color: '#000000',
  scoreLeft: -1,
  isWinner: false,
  rounds: [],
  legsWon: 0,
  setsWon: 0,
  statistics: {
    average: 0,
    playedMatches: 0,
    playedTrainings: 0,
    thrownDarts: 0,
    thrownOneHundredAndEighty: 0,
  }
});

const createInitialMatchData = (): Match => ({
  appVersion: APP_VERSION,
  createdAt: 123456789,
  initialScore: 501,
  matchCheckout: 'Double',
  matchStatus: 'started',
  matchMode: 'online',
  verificationMode: 'social',
  uuid: 'test-match-uuid',
  players: [
    createMockPlayer('p1', 'HostPlayer'),
    createMockPlayer('p2', 'GuestPlayer')
  ],
  updatedAt: 123456789,
  legs: 3,
  sets: 1
});

// --- Tests ---

describe('Multiplayer Game Logic Synchronization', () => {

  it('should initialize identical states for Host and Guest from the same Match Data', () => {
    const matchData = createInitialMatchData();

    // Host initializes locally
    const hostState = gameReducer({} as GameState, { type: 'INIT_GAME', payload: matchData });

    // Guest initializes from the received INIT_GAME broadcast
    const guestState = gameReducer({} as GameState, { type: 'INIT_GAME', payload: matchData });

    // Assertions
    expect(hostState).toEqual(guestState);
    expect(hostState.players[0].scoreLeft).toBe(501);
    expect(hostState.matchMode).toBe('online');
    expect(hostState.players).toHaveLength(2);
  });

  it('should remain perfectly synchronized after a sequence of throws and turn switches', () => {
    const matchData = createInitialMatchData();
    // Start from a synced state
    const initialState = gameReducer({} as GameState, { type: 'INIT_GAME', payload: matchData });

    // Note: In the actual app, 'THROW_DART' uses the internal multiplier state.
    // If we want to simulate T20, we must send TOGGLE_MULTIPLIER first.
    // Let's refine the sequence to be realistic.
    const complexActions: GameAction[] = [
      // P1: T20
      { type: 'TOGGLE_MULTIPLIER', payload: 'triple' },
      { type: 'THROW_DART', payload: { zone: 20 } }, 
      // P1: T20
      { type: 'TOGGLE_MULTIPLIER', payload: 'triple' },
      { type: 'THROW_DART', payload: { zone: 20 } },
      // P1: T20 (180!)
      { type: 'TOGGLE_MULTIPLIER', payload: 'triple' },
      { type: 'THROW_DART', payload: { zone: 20 } },
      
      { type: 'NEXT_TURN', payload: { elapsedTime: 10 } }
    ];

    // Apply actions to a "Host" state
    let hostState = { ...initialState };
    complexActions.forEach(action => {
      hostState = gameReducer(hostState, action);
    });

    // Apply actions to a "Guest" state
    let guestState = { ...initialState };
    complexActions.forEach(action => {
      guestState = gameReducer(guestState, action);
    });

    // Verify Sync
    expect(hostState).toEqual(guestState);
    
    // Verify Score Calculation (501 - 180 = 321)
    expect(hostState.players[0].scoreLeft).toBe(321);
    
    // Verify it is now Player 2's turn
    expect(hostState.currentPlayerIndex).toBe(1);
  });

  it('should handle UNDO_THROW correctly across clients', () => {
    const matchData = createInitialMatchData();
    let state = gameReducer({} as GameState, { type: 'INIT_GAME', payload: matchData });

    // Throw a dart
    state = gameReducer(state, { type: 'THROW_DART', payload: { zone: 20 } });
    expect(state.matchRound).toHaveLength(1);

    // Undo it
    state = gameReducer(state, { type: 'UNDO_THROW' });
    
    expect(state.matchRound).toHaveLength(0);
    
    // Ensure state is clean for next action
    const expectedEmptyRoundState = gameReducer({} as GameState, { type: 'INIT_GAME', payload: matchData });
    // Note: INIT_GAME resets round to empty, UNDO to empty should be effectively similar regarding matchRound
    expect(state.matchRound).toEqual(expectedEmptyRoundState.matchRound);
  });
});
