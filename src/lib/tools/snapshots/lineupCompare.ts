import type { ResolvedBindings } from '@lib/tools/resolver'

export const LINEUP_COMPARE_DATA: ResolvedBindings = {
  boat_a: {
    name: '1V 8+',
    seats: [
      { seat: 8, athlete: 'Wheeler, Ella', side: 'S' },
      { seat: 7, athlete: 'Spitz, Vivi', side: 'P' },
      { seat: 6, athlete: 'Miller, Star', side: 'S' },
      { seat: 5, athlete: 'Cox, Madeline', side: 'P' },
      { seat: 4, athlete: 'Brown, Hayley', side: 'S' },
      { seat: 3, athlete: 'Reid, Phoebe', side: 'P' },
      { seat: 2, athlete: 'Jamieson, Pippa', side: 'S' },
      { seat: 1, athlete: 'Park, Ana', side: 'P' },
    ],
  },
  boat_b: {
    name: '2V 8+',
    seats: [
      { seat: 8, athlete: 'Walsh, Sam', side: 'S' },
      { seat: 7, athlete: 'Doyle, Kate', side: 'P' },
      { seat: 6, athlete: 'Nguyen, Mia', side: 'S' },
      { seat: 5, athlete: 'Patel, Sara', side: 'P' },
      { seat: 4, athlete: 'Reese, Joy', side: 'S' },
      { seat: 3, athlete: 'Chen, Lara', side: 'P' },
      { seat: 2, athlete: 'Rao, Nina', side: 'S' },
      { seat: 1, athlete: 'Kim, Eun', side: 'P' },
    ],
  },
  seat_delta: {
    rows: [
      { seat: '8 (stroke)', a_split: '1:38.2', b_split: '1:39.4', delta: '+1.2' },
      { seat: '7', a_split: '1:38.6', b_split: '1:40.1', delta: '+1.5' },
      { seat: '6', a_split: '1:39.0', b_split: '1:40.3', delta: '+1.3' },
      { seat: '5', a_split: '1:39.2', b_split: '1:40.6', delta: '+1.4' },
      { seat: '4', a_split: '1:39.4', b_split: '1:40.8', delta: '+1.4' },
      { seat: '3', a_split: '1:40.1', b_split: '1:41.2', delta: '+1.1' },
      { seat: '2', a_split: '1:40.6', b_split: '1:41.7', delta: '+1.1' },
      { seat: '1 (bow)', a_split: '1:41.2', b_split: '1:42.4', delta: '+1.2' },
    ],
  },
}
