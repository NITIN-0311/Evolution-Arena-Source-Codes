
select * from game_history;

CREATE TABLE games
(
    game_id SERIAL PRIMARY KEY,
    players TEXT NOT NULL,
    player_count INT NOT NULL,
    winner_name VARCHAR(100),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE TABLE move_logs
(
    log_id SERIAL PRIMARY KEY,
    game_id INT NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    player_id INT NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    turn_number INT NOT NULL,
    move_used VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from move_logs;