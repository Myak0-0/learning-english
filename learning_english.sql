-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Июл 29 2026 г., 11:02
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `learning_english`
--

-- --------------------------------------------------------

--
-- Структура таблицы `answer_options`
--

CREATE TABLE `answer_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_option_id` bigint(20) UNSIGNED NOT NULL,
  `answer` varchar(255) NOT NULL,
  `option_for_task_option_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `answer_options`
--

INSERT INTO `answer_options` (`id`, `task_option_id`, `answer`, `option_for_task_option_id`) VALUES
(1, 1, 'was', 1),
(2, 2, 'am', 2),
(3, 2, 'will be', 3),
(4, 3, 'are', 4),
(5, 4, 'was', 5),
(6, 5, 'will be', 6),
(7, 6, 'were', 7),
(8, 6, 'are', 8),
(9, 8, 'This book is not interesting', NULL),
(10, 8, 'This book isn\'t interesting', NULL),
(11, 9, 'Is this book interesting', NULL),
(12, 11, 'The car will be cheap', NULL),
(13, 12, 'Will the car be cheap', NULL),
(14, 14, 'You were hungry yesterday evening', NULL),
(15, 15, 'You weren\'t hungry yesterday evening', NULL),
(16, 15, 'You were not hungry yesterday evening', NULL),
(17, 20, 'cock', NULL),
(18, 20, 'chicken', NULL),
(19, 21, 'cow', NULL),
(20, 22, 'goat', NULL),
(21, 23, 'pig', NULL),
(22, 24, 'sheep', NULL),
(24, 30, 'was', 11),
(25, 30, 'am', 12),
(31, 38, '123', NULL),
(32, 38, '321', NULL),
(33, 38, '123', NULL),
(42, 59, 'Ответ 1', NULL),
(43, 59, 'Ответ 2', NULL),
(44, 61, 'ответ', NULL),
(45, 62, 'Ответ', NULL),
(46, 63, 'Ответ 2', NULL),
(48, 65, 'was', 17),
(49, 65, 'is', 18),
(50, 66, 'Я пляж', NULL),
(51, 69, 'Курица', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `category_of_words`
--

CREATE TABLE `category_of_words` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `category_of_words`
--

INSERT INTO `category_of_words` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Слова из первого урока', '2026-07-27 13:50:05', '2026-07-27 13:50:05'),
(2, 'Местоимения', '2026-07-27 23:06:30', '2026-07-27 23:06:30');

-- --------------------------------------------------------

--
-- Структура таблицы `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_13_141346_create_sections_table', 1),
(5, '2026_07_13_141346_create_user_admins_table', 1),
(6, '2026_07_13_141346_create_user_rights_table', 1),
(7, '2026_07_13_141347_create_type_of_answers_table', 1),
(8, '2026_07_13_141347_create_type_of_media_table', 1),
(9, '2026_07_13_141348_create_tasks_table', 1),
(10, '2026_07_13_141349_create_category_of_words_table', 1),
(11, '2026_07_13_141349_create_words_table', 1),
(12, '2026_07_13_141350_create_user_time_of_repeatings_table', 1),
(13, '2026_07_13_141350_create_word_categories_table', 1),
(14, '2026_07_13_141356_create_task_options_table', 1),
(17, '2026_07_13_141360_create_theory_blocks_table', 1),
(20, '2026_07_13_141358_create_option_for_task_options_table', 3),
(21, '2026_07_13_162421_create_answer_options_table', 4),
(22, '2026_07_13_141357_create_user_task_answers_table', 5);

-- --------------------------------------------------------

--
-- Структура таблицы `option_for_task_options`
--

CREATE TABLE `option_for_task_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_option_id` bigint(20) UNSIGNED NOT NULL,
  `option` varchar(255) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `option_for_task_options`
--

INSERT INTO `option_for_task_options` (`id`, `task_option_id`, `option`, `order`) VALUES
(1, 1, 'was / were', 0),
(2, 2, 'am / is', 0),
(3, 2, 'will be / was', 1),
(4, 3, 'are / is', 0),
(5, 4, 'was / were', 0),
(6, 5, 'is / will be', 0),
(7, 6, 'was / were', 0),
(8, 6, 'are / am', 1),
(11, 30, 'was / were', 0),
(12, 30, 'am / is', 1),
(17, 65, 'was / were', 0),
(18, 65, 'am / is', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_topic` tinyint(1) NOT NULL DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `sections`
--

INSERT INTO `sections` (`id`, `title`, `parent_id`, `is_topic`, `order`, `created_at`, `updated_at`) VALUES
(492345, 'База граматика глаголов действия', 5249562, 1, 1, NULL, NULL),
(5249562, 'A1', NULL, 0, 0, NULL, NULL),
(8924656, 'Времена', 5249562, 0, 0, NULL, NULL),
(9485734, 'Граматика глаголов to be', 8924656, 1, 2, NULL, NULL),
(9520212, 'A2', NULL, 0, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('4dTfNH36Xqk4ipr8wbn5h1IyZiGu3jcu3hi20oDI', 1526434, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiaHZqSUpjVFFWMWYzWjZzZUVLV1BUbjVybHJhTDAxZUEwSjBsNGtZMCI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjUzOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvc3RyZWFtLWF1ZGlvL2xvb2tzbWF4eGluZy0wLm1wMyI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTUyNjQzNDt9', 1785312256),
('FdQo0sVyCbPBbXSIz32RAfYXOwv5YYDaqvx0Rz91', 4568234, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiZEpFZU5EWUdWODZTUWVzeXJ5Z3QzUGNPbzRZUUhYUTAwTGlldXRSayI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6NDU2ODIzNDtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo1NjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2FkZC10b3BpYz9wYWdlPTUmc2VjdGlvbl9pZD00OTIzNDUiO3M6NToicm91dGUiO3M6OToiYWRkLXRvcGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czoxNzoiYWN0aXZlX3N0dWRlbnRfaWQiO2k6MTUyNjQzNDt9', 1785315288);

-- --------------------------------------------------------

--
-- Структура таблицы `tasks`
--

CREATE TABLE `tasks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `type_of_answer_id` bigint(20) UNSIGNED NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type_of_media_id` bigint(20) UNSIGNED NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `page` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `tasks`
--

INSERT INTO `tasks` (`id`, `section_id`, `type_of_answer_id`, `description`, `type_of_media_id`, `order`, `page`, `created_at`, `updated_at`) VALUES
(1, 492345, 2, '\"Fill the Gap\" (Заполните пропуски)', 3, 0, 2, '2026-07-17 05:39:13', '2026-07-17 05:39:13'),
(2, 492345, 1, '\"Positive, Negative, Question\" Переделайте предложения в другую форму', 3, 1, 2, '2026-07-17 05:39:13', '2026-07-17 05:39:13'),
(3, 492345, 3, 'Ответь на вопросы', 3, 2, 2, '2026-07-21 16:40:07', '2026-07-21 16:40:07'),
(5, 492345, 1, 'Напишите что изображено на картинке', 1, 0, 3, '2026-07-22 05:44:30', '2026-07-22 05:44:30'),
(6, 492345, 3, 'Напишите что изображено на картинке (без правильного', 1, 1, 3, '2026-07-22 05:44:30', '2026-07-22 05:44:30'),
(7, 492345, 3, 'Посмотрите видео, ответьте на вопросы', 2, 2, 3, '2026-07-22 08:14:00', '2026-07-22 08:14:00'),
(8, 492345, 3, 'Послушайте запись, ответьте на вопросы', 5, 3, 3, '2026-07-22 08:14:00', '2026-07-22 08:14:00'),
(12, 492345, 2, 'Задача', 3, 2, 5, '2026-07-25 00:20:13', '2026-07-26 01:01:11'),
(18, 492345, 1, 'Задача', 3, 6, 5, '2026-07-25 03:29:24', '2026-07-25 03:29:24'),
(55, 492345, 1, 'Задача', 1, 10, 5, '2026-07-26 03:55:07', '2026-07-26 03:55:07'),
(57, 492345, 1, 'фыа', 3, 12, 5, '2026-07-26 03:58:01', '2026-07-26 03:58:01'),
(58, 492345, 1, 'Задача', 3, 13, 5, '2026-07-26 05:49:28', '2026-07-26 05:49:28'),
(71, 492345, 2, 'Выберите правильный ответ', 3, 14, 5, '2026-07-27 02:50:19', '2026-07-27 02:50:19'),
(72, 492345, 1, 'Переведите', 3, 15, 5, '2026-07-27 02:51:23', '2026-07-27 02:51:23'),
(73, 492345, 3, 'Аудио', 5, 16, 5, '2026-07-27 03:18:20', '2026-07-27 03:18:20'),
(74, 492345, 3, 'Опишу', 1, 17, 5, '2026-07-27 03:22:07', '2026-07-27 03:22:07'),
(75, 492345, 1, 'Курица', 1, 18, 5, '2026-07-27 03:22:35', '2026-07-27 03:22:35');

-- --------------------------------------------------------

--
-- Структура таблицы `task_options`
--

CREATE TABLE `task_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `task_options`
--

INSERT INTO `task_options` (`id`, `task_id`, `content`, `order`) VALUES
(1, 1, 'Yesterday my friend (___) very tired after work.', 0),
(2, 1, 'I (___) a student now, but next year I (___) a teacher.', 1),
(3, 1, 'My parents (___) in the shop at the moment.', 2),
(4, 1, 'It (___) very cold last winter.', 3),
(5, 1, 'Tomorrow the weather (___) beautiful and warm.', 4),
(6, 1, 'My keys (___) on the table this morning, but now they (___) gone!', 5),
(7, 2, '1. Positive: This book is interesting.', 0),
(8, 2, 'Negative: (___)', 1),
(9, 2, 'Question: (___)', 2),
(10, 2, '2. Negative: The car won\'t be cheap.', 3),
(11, 2, 'Positive: (___)', 4),
(12, 2, 'Question: (___)', 5),
(13, 2, '3. Question: Were you hungry yesterday evening?', 6),
(14, 2, 'Positive: (___)', 7),
(15, 2, 'Negative: (___)', 8),
(18, 3, 'Почему он так сказал? (___)', 0),
(19, 3, 'Как ты думаешь теперь?', 1),
(20, 5, 'cock.jpg(___)', 0),
(21, 5, 'cow.jpg(___)', 1),
(22, 5, 'goat.jpg(___)', 2),
(23, 5, 'pig.jpg(___)', 3),
(24, 5, 'sheep.jpg(___)', 4),
(25, 6, 'cock.jpg(___)', 0),
(26, 7, 'https://www.youtube.com/embed/P1_TGLibPR0', 0),
(27, 8, 'looksmaxxing-0.mp3', 0),
(30, 12, 'Yesterday I (___) at home. Now I (___) walking', 0),
(38, 18, 'Вопрос (___) о нет (___)', 0),
(59, 55, '1785063307_1802.png (___)', 0),
(61, 57, 'фывфы (___)', 0),
(62, 58, 'Первый вопрос (___)', 0),
(63, 58, 'Второй вопрос (___)', 1),
(65, 71, 'Yesterday I (___) here (___)', 0),
(66, 72, 'I am a bitch (___)', 0),
(67, 73, '1785147500_9851.mp3', 0),
(68, 74, '1785147727_2236.png (___)', 0),
(69, 75, '1785147755_9328.png (___)', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `theory_blocks`
--

CREATE TABLE `theory_blocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `type_of_media_id` bigint(20) UNSIGNED NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`content`)),
  `order` int(11) NOT NULL DEFAULT 0,
  `page` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `theory_blocks`
--

INSERT INTO `theory_blocks` (`id`, `section_id`, `type_of_media_id`, `content`, `order`, `page`, `created_at`, `updated_at`) VALUES
(1, 492345, 3, '{\r\n\"content\": \"Мы используем эти вспомогательные глаголы, когда в предложении есть глагол (гулять, думать, любить, приходить).\\nДЕЙСТВИЕ: I %work% here. (Я работаю здесь).\\nДЕЙСТВИЕ: She %lives% in Moscow. (Она живет в Москве).\"\r\n}', 1, 1, '2026-07-16 04:22:49', '2026-07-24 22:01:57'),
(2, 492345, 1, '{\r\n\"content\": \"base compose english sentences.png\"\r\n}', 2, 1, '2026-07-16 04:22:49', '2026-07-24 22:01:57'),
(3, 492345, 7, '{\r\n\"content\": \"Местоимения\"\r\n}', 3, 1, '2026-07-16 04:22:49', '2026-07-16 04:22:49'),
(4, 492345, 7, '{\n\"content\": \"Построение предложений. Правила предложений действий\"\n}', 0, 1, '2026-07-16 04:22:49', '2026-07-24 02:12:06'),
(5, 492345, 4, '{\n\"head\": [\"Кто?\",\"Кого? Кому?\"],\n\"columns\": [\n  [\"I - Я\", \"Me - мне, меня\"],\n  [\"You - Ты, Вы\", \"You - тебе, тебя\"],\n  [\"He - Он\", \"Him - его, ему\"],\n  [\"She - Она\", \"Her - её, ей\"],\n  [\"We - Мы\", \"Us - нас, нам\"],\n  [\"They - Они\", \"Them - их, им\"]\n]\n}', 4, 1, '2026-07-16 04:22:49', '2026-07-16 04:22:49'),
(6, 492345, 6, '{\r\n\"content\": [\r\n  \"1\",\r\n  \"2\",\r\n  \"3\",\r\n  \"4\",\r\n  \"5\",\r\n  \"6\",\r\n  \"7\",\r\n  \"8\",\r\n  \"9\",\r\n  \"10\"\r\n]\r\n}', 6, 1, '2026-07-16 07:19:16', '2026-07-24 02:13:37'),
(7, 492345, 2, '{\n\"content\": \"https://www.youtube.com/embed/P1_TGLibPR0\"\n}', 5, 1, NULL, '2026-07-24 02:11:48'),
(8, 492345, 5, '{\r\n\"content\": \"looksmaxxing-0.mp3\"\r\n}', 7, 1, NULL, '2026-07-24 02:13:37'),
(11, 492345, 7, '{\"content\":\"\\u041f\\u043e\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u0438\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0439. \\u041f\\u0440\\u0430\\u0432\\u0438\\u043b\\u0430 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0439 \\u0441\\u043e\\u0441\\u0442\\u043e\\u044f\\u043d\\u0438\\u0439\"}', 0, 4, '2026-07-24 03:25:27', '2026-07-26 01:01:23'),
(12, 492345, 3, '{\"content\":\"\\u041c\\u044b \\u0438\\u0441\\u043f\\u043e\\u043b\\u044c\\u0437\\u0443\\u0435\\u043c \\u0433\\u043b\\u0430\\u0433\\u043e\\u043b\\u044b %to be%, \\u043a\\u043e\\u0433\\u0434\\u0430 \\u043e\\u043f\\u0438\\u0441\\u044b\\u0432\\u0430\\u0435\\u043c \\u0441\\u043e\\u0441\\u0442\\u043e\\u044f\\u043d\\u0438\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043c\\u0435\\u0442\\u0430 \\u0438\\u043b\\u0438 \\u0447\\u0435\\u043b\\u043e\\u0432\\u0435\\u043a\\u0430. (\\u043c\\u0435\\u0441\\u0442\\u043e\\u043f\\u043e\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435, \\u043a\\u0430\\u043a\\u043e\\u0439 \\u0447\\u0435\\u043b\\u043e\\u0432\\u0435\\u043a\\/\\u043f\\u0440\\u0435\\u0434\\u043c\\u0435\\u0442, \\u043a\\u043e\\u0433\\u0434\\u0430, \\u043a\\u0435\\u043c \\u044f\\u0432\\u043b\\u044f\\u0435\\u0442\\u0441\\u044f \\u0447\\u0435\\u043b\\u043e\\u0432\\u0435\\u043a)\\n\\n\\u041a\\u0422\\u041e \\/ \\u0427\\u0422\\u041e \\u044d\\u0442\\u043e: I %am% a teacher. (\\u042f \\u2014 \\u0443\\u0447\\u0438\\u0442\\u0435\\u043b\\u044c).\\n\\u0413\\u0414\\u0415 \\u044d\\u0442\\u043e: They %are% at home. (\\u041e\\u043d\\u0438 \\u2014 \\u0434\\u043e\\u043c\\u0430).\\n\\u041a\\u0410\\u041a\\u041e\\u0419 \\u044d\\u0442\\u043e: The weather %is% good. (\\u041f\\u043e\\u0433\\u043e\\u0434\\u0430 \\u2014 \\u0445\\u043e\\u0440\\u043e\\u0448\\u0430\\u044f).\\n\\u041a\\u041e\\u0413\\u0414\\u0410 \\u044d\\u0442\\u043e: It %is% 5 o\'clock. (\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u2014 5 \\u0447\\u0430\\u0441\\u043e\\u0432).\"}', 1, 4, '2026-07-24 03:26:11', '2026-07-26 01:01:23'),
(15, 492345, 7, '{\"content\":\"\\u0413\\u0440\\u0443\\u043f\\u043f\\u0430 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u0438\\u0442\\u0435\\u043b\\u044c\\u043d\\u044b\\u0445 \\u0441\\u043b\\u043e\\u0432\"}', 4, 4, '2026-07-24 03:45:35', '2026-07-26 01:01:28'),
(18, 492345, 4, '{\"head\":[\"\\u0421\\u043b\\u043e\\u0432\\u043e\",\"\\u041f\\u0435\\u0440\\u0435\\u0432\\u043e\\u0434\"],\"columns\":[[\"What\",\"\\u0427\\u0442\\u043e, \\u041a\\u0430\\u043a\\u043e\\u0439\"],[\"Where\",\"\\u0413\\u0434\\u0435, \\u041a\\u0443\\u0434\\u0430\"],[\"When\",\"\\u041a\\u043e\\u0433\\u0434\\u0430\"],[\"Why\",\"\\u041f\\u043e\\u0447\\u0435\\u043c\\u0443, \\u0417\\u0430\\u0447\\u0435\\u043c\"],[\"Who\",\"\\u041a\\u0442\\u043e\"],[\"How\",\"\\u041a\\u0430\\u043a, \\u041a\\u0430\\u043a\\u0438\\u043c \\u043e\\u0431\\u0440\\u0430\\u0437\\u043e\\u043c\"]]}', 5, 4, '2026-07-24 03:50:14', '2026-07-26 01:01:28'),
(19, 492345, 6, '{\"content\":[2,3,4]}', 6, 4, '2026-07-24 03:51:01', '2026-07-24 03:51:01'),
(20, 492345, 2, '{\"content\":\"https:\\/\\/www.youtube.com\\/embed\\/i629FX3A7Us\"}', 7, 4, '2026-07-24 03:51:55', '2026-07-24 03:51:55'),
(22, 492345, 7, '{\"content\":\"\\u041f\\u043e\\u0441\\u043b\\u0443\\u0448\\u0430\\u0439\\u0442\\u0435\"}', 8, 4, '2026-07-24 03:59:04', '2026-07-24 03:59:06');

-- --------------------------------------------------------

--
-- Структура таблицы `type_of_answers`
--

CREATE TABLE `type_of_answers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `type_of_answers`
--

INSERT INTO `type_of_answers` (`id`, `name`) VALUES
(1, 'input'),
(2, 'choice'),
(3, 'no-answer');

-- --------------------------------------------------------

--
-- Структура таблицы `type_of_media`
--

CREATE TABLE `type_of_media` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `type_of_media`
--

INSERT INTO `type_of_media` (`id`, `name`) VALUES
(1, 'image'),
(2, 'video'),
(3, 'text'),
(4, 'table'),
(5, 'audio'),
(6, 'word'),
(7, 'title'),
(8, 'dialogue');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `english_level` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `login`, `password`, `name`, `birth_date`, `english_level`, `remember_token`, `created_at`, `updated_at`) VALUES
(1526434, 'student', '$2y$12$0i47gKrLE/8OMFTa1UicweR3phCEMe8wqzv5Bu4OyFsFWxfQ.DiQ2', 'Студент', NULL, NULL, NULL, NULL, NULL),
(1829112, 'student2', '$2y$12$0i47gKrLE/8OMFTa1UicweR3phCEMe8wqzv5Bu4OyFsFWxfQ.DiQ2', 'Студент 2.0', NULL, NULL, NULL, NULL, NULL),
(4568234, 'admin', '$2y$12$0i47gKrLE/8OMFTa1UicweR3phCEMe8wqzv5Bu4OyFsFWxfQ.DiQ2', 'Владислав', NULL, 'Native', 'eAlVTB582orQsLEmbyQeyQM9rIF4dYWgN0SLEvgVErOsuyvlR8hm1y2NtZUf', '2026-07-13 19:30:19', '2026-07-13 19:30:19'),
(5924501, 'student 3', '$2y$12$2LjwVKWeebGa62ZmGIfGdulUZVNXEMeyxQEGOW0oLl7SOV.naJ7c.', 'Студент 3', NULL, 'A1', NULL, '2026-07-28 04:05:19', '2026-07-28 04:05:19');

-- --------------------------------------------------------

--
-- Структура таблицы `user_admins`
--

CREATE TABLE `user_admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_admins`
--

INSERT INTO `user_admins` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 4568234, '2026-07-14 02:31:00', '2026-07-14 02:31:00');

-- --------------------------------------------------------

--
-- Структура таблицы `user_rights`
--

CREATE TABLE `user_rights` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_rights`
--

INSERT INTO `user_rights` (`id`, `user_id`, `section_id`, `created_at`, `updated_at`) VALUES
(6, 1526434, 5249562, '2026-07-22 03:38:50', '2026-07-22 03:38:50'),
(11, 1526434, 9485734, '2026-07-27 05:00:43', '2026-07-27 05:00:43'),
(12, 1526434, 8924656, '2026-07-27 05:00:44', '2026-07-27 05:00:44'),
(14, 1526434, 492345, '2026-07-27 05:23:29', '2026-07-27 05:23:29'),
(15, 5924501, 5249562, '2026-07-28 04:06:14', '2026-07-28 04:06:14');

-- --------------------------------------------------------

--
-- Структура таблицы `user_task_answers`
--

CREATE TABLE `user_task_answers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `task_option_id` bigint(20) UNSIGNED NOT NULL,
  `answer` varchar(255) NOT NULL,
  `option_for_task_option_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_task_answers`
--

INSERT INTO `user_task_answers` (`id`, `user_id`, `task_option_id`, `answer`, `option_for_task_option_id`, `is_correct`, `created_at`, `updated_at`) VALUES
(8, 1526434, 1, 'was', 1, 1, '2026-07-21 03:50:37', '2026-07-21 03:50:37'),
(9, 1526434, 2, 'was', 3, 0, '2026-07-21 03:50:42', '2026-07-21 03:50:42'),
(10, 1526434, 8, 'ответ 2', NULL, 0, '2026-07-21 03:50:49', '2026-07-21 03:50:49'),
(11, 1526434, 8, 'ответ 23', NULL, 0, '2026-07-21 03:51:02', '2026-07-21 03:51:02'),
(12, 1526434, 2, 'is', 2, 0, '2026-07-21 03:54:16', '2026-07-21 03:54:16'),
(13, 1526434, 2, 'am', 2, 1, '2026-07-21 03:54:17', '2026-07-21 03:54:17'),
(14, 1526434, 8, 'а', NULL, 0, '2026-07-21 03:55:23', '2026-07-21 03:55:23'),
(15, 1526434, 9, 'ф', NULL, 0, '2026-07-21 03:56:34', '2026-07-21 03:56:34'),
(17, 1526434, 6, 'am', 8, 0, '2026-07-21 08:14:44', '2026-07-21 08:14:44'),
(18, 1526434, 5, 'is', 6, 0, '2026-07-21 08:14:47', '2026-07-21 08:14:47'),
(19, 1526434, 6, 'was', 7, 0, '2026-07-21 08:14:50', '2026-07-21 08:14:50'),
(20, 1526434, 4, 'were', 5, 0, '2026-07-21 08:14:51', '2026-07-21 08:14:51'),
(21, 1526434, 3, 'is', 4, 0, '2026-07-21 08:14:53', '2026-07-21 08:14:53'),
(22, 1526434, 2, 'will be', 3, 1, '2026-07-21 08:14:57', '2026-07-21 08:14:57'),
(23, 1526434, 8, 'this book is not interestin', NULL, 0, '2026-07-21 08:35:47', '2026-07-21 08:35:47'),
(24, 1526434, 8, 'this book is not interesting', NULL, 1, '2026-07-21 08:36:48', '2026-07-21 08:36:48'),
(25, 1526434, 9, 'is this book interesting', NULL, 1, '2026-07-21 09:36:06', '2026-07-21 09:36:06'),
(26, 1526434, 11, 'а', NULL, 0, '2026-07-21 09:45:12', '2026-07-21 09:45:12'),
(27, 1526434, 11, 'a', NULL, 0, '2026-07-21 21:02:17', '2026-07-21 21:02:17'),
(31, 1526434, 18, 'ответ 255', NULL, 1, '2026-07-21 22:38:06', '2026-07-27 03:35:52'),
(32, 1526434, 3, 'are', 4, 1, '2026-07-21 22:38:30', '2026-07-21 22:38:30'),
(33, 1526434, 4, 'was', 5, 1, '2026-07-21 23:24:03', '2026-07-21 23:24:03'),
(34, 1526434, 11, 'ответ', NULL, 0, '2026-07-21 23:24:11', '2026-07-21 23:24:11'),
(35, 1526434, 20, 'c', NULL, 0, '2026-07-22 00:59:38', '2026-07-22 00:59:38'),
(36, 1526434, 20, 'ca', NULL, 0, '2026-07-22 01:01:26', '2026-07-22 01:01:26'),
(37, 1526434, 20, 'cock', NULL, 1, '2026-07-22 01:01:42', '2026-07-22 01:01:42'),
(38, 1526434, 21, 'a', NULL, 0, '2026-07-22 01:03:45', '2026-07-22 01:03:45'),
(39, 1526434, 21, 'as', NULL, 0, '2026-07-22 01:03:50', '2026-07-22 01:03:50'),
(40, 1526434, 21, 'ass', NULL, 0, '2026-07-22 01:04:47', '2026-07-22 01:04:47'),
(41, 1526434, 21, 'assd', NULL, 0, '2026-07-22 01:04:49', '2026-07-22 01:04:49'),
(42, 1526434, 21, 'assdf', NULL, 0, '2026-07-22 01:05:13', '2026-07-22 01:05:13'),
(43, 1526434, 21, 'assdfa', NULL, 0, '2026-07-22 01:05:14', '2026-07-22 01:05:14'),
(44, 1526434, 21, 'cow', NULL, 1, '2026-07-22 01:05:18', '2026-07-22 01:05:18'),
(45, 1526434, 25, 'отвечаю', NULL, 1, '2026-07-22 01:07:55', '2026-07-28 19:40:14'),
(46, 1829112, 20, 'cock', NULL, 1, '2026-07-22 05:56:26', '2026-07-22 05:56:26'),
(47, 1526434, 5, 'will be', 6, 1, '2026-07-23 02:32:34', '2026-07-23 02:32:34'),
(48, 1526434, 6, 'were', 7, 1, '2026-07-25 00:24:44', '2026-07-25 00:24:44'),
(49, 1526434, 30, 'were', 11, 0, '2026-07-25 00:30:15', '2026-07-25 00:30:15'),
(50, 1526434, 30, 'was', 11, 1, '2026-07-25 00:30:16', '2026-07-25 00:30:16'),
(51, 1526434, 6, 'are', 8, 1, '2026-07-25 00:30:34', '2026-07-25 00:30:34'),
(57, 1526434, 38, '123', NULL, 1, '2026-07-25 03:29:37', '2026-07-25 03:29:37'),
(66, 1526434, 30, 'am', 12, 1, '2026-07-26 21:41:14', '2026-07-26 21:41:14'),
(74, 1526434, 61, 'пишу', NULL, 0, '2026-07-27 00:58:50', '2026-07-27 00:58:50'),
(75, 1526434, 61, 'ответ', NULL, 1, '2026-07-27 00:58:57', '2026-07-27 00:58:57'),
(76, 1526434, 65, 'were', 17, 0, '2026-07-27 02:51:52', '2026-07-27 02:51:52'),
(77, 1526434, 65, 'was', 17, 1, '2026-07-27 02:51:58', '2026-07-27 02:51:58'),
(78, 1526434, 65, 'is', 18, 1, '2026-07-27 02:52:03', '2026-07-27 02:52:03'),
(79, 1526434, 66, 'я сука', NULL, 0, '2026-07-27 02:52:09', '2026-07-27 02:52:09'),
(80, 1526434, 66, 'я пляж', NULL, 1, '2026-07-27 02:52:16', '2026-07-27 02:52:16'),
(81, 1526434, 68, 'нет', NULL, 1, '2026-07-27 03:22:15', '2026-07-27 04:32:08'),
(82, 1526434, 69, 'курица', NULL, 1, '2026-07-27 03:22:43', '2026-07-27 03:22:43'),
(83, 1526434, 62, '2', NULL, 0, '2026-07-27 03:30:52', '2026-07-27 03:30:52'),
(84, 1526434, 62, '23', NULL, 0, '2026-07-27 03:31:08', '2026-07-27 03:31:08'),
(85, 1526434, 11, 'the car will be cheap', NULL, 1, '2026-07-27 03:33:40', '2026-07-27 03:33:40'),
(86, 1526434, 12, 'will the car be', NULL, 0, '2026-07-27 03:33:58', '2026-07-27 03:33:58'),
(87, 1526434, 12, 'will the car be cheap', NULL, 1, '2026-07-27 03:34:02', '2026-07-27 03:34:02'),
(88, 1526434, 62, 'пишу свой ответ', NULL, 0, '2026-07-27 03:48:44', '2026-07-27 03:48:44'),
(89, 1526434, 62, '123', NULL, 0, '2026-07-27 04:33:26', '2026-07-27 04:33:26'),
(90, 1526434, 62, 'первый', NULL, 0, '2026-07-27 04:33:32', '2026-07-27 04:33:32');

-- --------------------------------------------------------

--
-- Структура таблицы `user_time_of_repeatings`
--

CREATE TABLE `user_time_of_repeatings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `word_id` bigint(20) UNSIGNED NOT NULL,
  `repeating` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_time_of_repeatings`
--

INSERT INTO `user_time_of_repeatings` (`id`, `user_id`, `word_id`, `repeating`, `created_at`, `updated_at`) VALUES
(11, 1526434, 9, 0, '2026-07-27 06:26:33', '2026-07-27 06:26:33'),
(18, 1526434, 6, 0, '2026-07-27 06:30:58', '2026-07-27 06:30:58'),
(19, 1526434, 7, 0, '2026-07-27 06:30:58', '2026-07-27 06:30:58'),
(24, 1526434, 10, 0, '2026-07-28 21:48:06', '2026-07-28 21:48:06'),
(25, 1526434, 1, 0, '2026-07-29 01:04:11', '2026-07-29 01:04:11'),
(26, 1526434, 2, 0, '2026-07-29 01:04:11', '2026-07-29 01:04:11'),
(27, 1526434, 3, 0, '2026-07-29 01:04:11', '2026-07-29 01:04:11'),
(28, 1526434, 4, 0, '2026-07-29 01:04:11', '2026-07-29 01:04:11'),
(29, 1526434, 5, 0, '2026-07-29 01:04:11', '2026-07-29 01:04:11'),
(30, 1526434, 8, 0, '2026-07-29 01:04:11', '2026-07-29 01:04:11');

-- --------------------------------------------------------

--
-- Структура таблицы `words`
--

CREATE TABLE `words` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `translation` varchar(255) NOT NULL,
  `audio` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `words`
--

INSERT INTO `words` (`id`, `name`, `translation`, `audio`, `created_at`, `updated_at`) VALUES
(1, 'I', 'Я', 'I.mp3', NULL, NULL),
(2, 'he', 'он', 'He.mp3', NULL, NULL),
(3, 'her', 'ей, её', 'Her.mp3', NULL, NULL),
(4, 'him', 'его, ему', 'Him.mp3', NULL, NULL),
(5, 'me', 'мне, меня', 'Me.mp3', NULL, NULL),
(6, 'she', 'она', 'She.mp3', NULL, NULL),
(7, 'them', 'их, им', 'Them.mp3', NULL, NULL),
(8, 'they', 'они', 'They.mp3', NULL, NULL),
(9, 'us', 'нас, нам', 'Us.mp3', NULL, NULL),
(10, 'we', 'мы', 'We.mp3', NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `word_categories`
--

CREATE TABLE `word_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `word_id` bigint(20) UNSIGNED NOT NULL,
  `category_of_word_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `word_categories`
--

INSERT INTO `word_categories` (`id`, `word_id`, `category_of_word_id`) VALUES
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
(6, 6, 1),
(7, 7, 1),
(8, 8, 1),
(9, 9, 1),
(10, 10, 1),
(11, 1, 1),
(12, 2, 1);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `answer_options`
--
ALTER TABLE `answer_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `answer_options_task_option_id_foreign` (`task_option_id`),
  ADD KEY `answer_options_option_for_task_option_id_foreign` (`option_for_task_option_id`);

--
-- Индексы таблицы `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Индексы таблицы `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Индексы таблицы `category_of_words`
--
ALTER TABLE `category_of_words`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Индексы таблицы `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Индексы таблицы `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `option_for_task_options`
--
ALTER TABLE `option_for_task_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `option_for_task_options_task_option_id_foreign` (`task_option_id`);

--
-- Индексы таблицы `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Индексы таблицы `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sections_parent_id_foreign` (`parent_id`);

--
-- Индексы таблицы `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Индексы таблицы `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_section_id_foreign` (`section_id`),
  ADD KEY `tasks_type_of_answer_id_foreign` (`type_of_answer_id`),
  ADD KEY `tasks_type_of_media_id_foreign` (`type_of_media_id`);

--
-- Индексы таблицы `task_options`
--
ALTER TABLE `task_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_options_task_id_foreign` (`task_id`);

--
-- Индексы таблицы `theory_blocks`
--
ALTER TABLE `theory_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `theory_blocks_section_id_foreign` (`section_id`),
  ADD KEY `theory_blocks_type_of_media_id_foreign` (`type_of_media_id`);

--
-- Индексы таблицы `type_of_answers`
--
ALTER TABLE `type_of_answers`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `type_of_media`
--
ALTER TABLE `type_of_media`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_login_unique` (`login`);

--
-- Индексы таблицы `user_admins`
--
ALTER TABLE `user_admins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_admins_user_id_foreign` (`user_id`);

--
-- Индексы таблицы `user_rights`
--
ALTER TABLE `user_rights`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_rights_user_id_foreign` (`user_id`),
  ADD KEY `user_rights_section_id_foreign` (`section_id`);

--
-- Индексы таблицы `user_task_answers`
--
ALTER TABLE `user_task_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_task_answers_user_id_foreign` (`user_id`),
  ADD KEY `user_task_answers_task_option_id_foreign` (`task_option_id`),
  ADD KEY `user_task_answers_option_for_task_option_id_foreign` (`option_for_task_option_id`);

--
-- Индексы таблицы `user_time_of_repeatings`
--
ALTER TABLE `user_time_of_repeatings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_time_of_repeatings_user_id_foreign` (`user_id`),
  ADD KEY `user_time_of_repeatings_word_id_foreign` (`word_id`);

--
-- Индексы таблицы `words`
--
ALTER TABLE `words`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `word_categories`
--
ALTER TABLE `word_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `word_categories_word_id_foreign` (`word_id`),
  ADD KEY `word_categories_category_of_word_id_foreign` (`category_of_word_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `answer_options`
--
ALTER TABLE `answer_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT для таблицы `category_of_words`
--
ALTER TABLE `category_of_words`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT для таблицы `option_for_task_options`
--
ALTER TABLE `option_for_task_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT для таблицы `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT для таблицы `task_options`
--
ALTER TABLE `task_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT для таблицы `theory_blocks`
--
ALTER TABLE `theory_blocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT для таблицы `type_of_answers`
--
ALTER TABLE `type_of_answers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `type_of_media`
--
ALTER TABLE `type_of_media`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `user_admins`
--
ALTER TABLE `user_admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `user_rights`
--
ALTER TABLE `user_rights`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT для таблицы `user_task_answers`
--
ALTER TABLE `user_task_answers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT для таблицы `user_time_of_repeatings`
--
ALTER TABLE `user_time_of_repeatings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT для таблицы `words`
--
ALTER TABLE `words`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT для таблицы `word_categories`
--
ALTER TABLE `word_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `answer_options`
--
ALTER TABLE `answer_options`
  ADD CONSTRAINT `answer_options_option_for_task_option_id_foreign` FOREIGN KEY (`option_for_task_option_id`) REFERENCES `option_for_task_options` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `answer_options_task_option_id_foreign` FOREIGN KEY (`task_option_id`) REFERENCES `task_options` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `option_for_task_options`
--
ALTER TABLE `option_for_task_options`
  ADD CONSTRAINT `option_for_task_options_task_option_id_foreign` FOREIGN KEY (`task_option_id`) REFERENCES `task_options` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`),
  ADD CONSTRAINT `tasks_type_of_answer_id_foreign` FOREIGN KEY (`type_of_answer_id`) REFERENCES `type_of_answers` (`id`),
  ADD CONSTRAINT `tasks_type_of_media_id_foreign` FOREIGN KEY (`type_of_media_id`) REFERENCES `type_of_media` (`id`);

--
-- Ограничения внешнего ключа таблицы `task_options`
--
ALTER TABLE `task_options`
  ADD CONSTRAINT `task_options_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `theory_blocks`
--
ALTER TABLE `theory_blocks`
  ADD CONSTRAINT `theory_blocks_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`),
  ADD CONSTRAINT `theory_blocks_type_of_media_id_foreign` FOREIGN KEY (`type_of_media_id`) REFERENCES `type_of_media` (`id`);

--
-- Ограничения внешнего ключа таблицы `user_admins`
--
ALTER TABLE `user_admins`
  ADD CONSTRAINT `user_admins_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_rights`
--
ALTER TABLE `user_rights`
  ADD CONSTRAINT `user_rights_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_rights_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_task_answers`
--
ALTER TABLE `user_task_answers`
  ADD CONSTRAINT `user_task_answers_option_for_task_option_id_foreign` FOREIGN KEY (`option_for_task_option_id`) REFERENCES `option_for_task_options` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_task_answers_task_option_id_foreign` FOREIGN KEY (`task_option_id`) REFERENCES `task_options` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_task_answers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_time_of_repeatings`
--
ALTER TABLE `user_time_of_repeatings`
  ADD CONSTRAINT `user_time_of_repeatings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_time_of_repeatings_word_id_foreign` FOREIGN KEY (`word_id`) REFERENCES `words` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `word_categories`
--
ALTER TABLE `word_categories`
  ADD CONSTRAINT `word_categories_category_of_word_id_foreign` FOREIGN KEY (`category_of_word_id`) REFERENCES `category_of_words` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `word_categories_word_id_foreign` FOREIGN KEY (`word_id`) REFERENCES `words` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
