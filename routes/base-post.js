'use strict';

const express = require('express');
const router = express.Router();

const log = require('../libs/winston-init')(module);
const i18n = require('i18n');
const async = require('async');
const handlebarsCompile = require('../libs/handlebars-compile');

const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;


/**
 * Добавить требование
 */

router.post('/doc/demand-into-parts/', require(__dirname +'/post/demand-into-parts'));

/**
 * Удалить требование
 */

router.post('/doc/demand-remove/', require(__dirname +'/post/demand-remove'));

/**
 * Классификация требования
 */

router.post('/doc/result-paragraph-check', require(__dirname +'/post/result-paragraph-check'));

/**
 * Получить классификацию у требования
 */

router.post('/doc/get-demand-classif', require(__dirname +'/post/get-demand-classif'));

/**
 * Передать классификацию в ПАО
 */

router.post('/doc/submit-classification', require(__dirname +'/post/submit-classification'));


/**
 * Создать/удалить пресет
 */

router.post('/doc/ready-made', require(__dirname +'/post/ready-made'));

/**
 * Получить значения пресета
 */

router.post('/doc/get-ready-made', require(__dirname +'/post/get-ready-made'));

/**
 * Получить пресеты от веника по клику обзаца
 */

router.post('/doc/get-from-brooms', require(__dirname +'/post/get-from-brooms'));

/**
 * Временно!!
 * 
 * Конвертировать pid в текст
 * Доступно только разработчику
 * 
 */

router.post('/doc/pids-to-text', require(__dirname +'/test-tmp/pids-to-text'));


/**
 * Добавить/удалить папки пользователя
 */

router.post('/add-remove-collections', require(__dirname +'/post/add-remove-collections'));


/**
 * Добавить/удалить документы на анализ в папку по умолчанию
 */

router.post('/add-docs-analysis', require(__dirname +'/post/add-docs-analysis'));


/**
 * Добавить/удалить документы из папки пользователя
 */

router.post('/add-remove-docs-to-collections', require(__dirname +'/post/add-remove-docs-to-collections'));

/**
 * Получит id списка возможных документов после интеллектуального/атрибутного поиска
 */

router.post('/search-results-kod/', require(__dirname +'/post/search-results-kod'));


/**
 * Атрибутный поиск по ИСУНД АСУТП
 */

router.post('/attribute-search/', require(__dirname +'/post/attribute-search'));


/**
 * Основная логика Отчет о стадиях классификации
 */
router.post('/reports/reports-type-1-filter', require(__dirname +'/post/reports-type-1-filter'));

/**
 * Отчет о классифицированных
 */
router.post('/reports/reports-type-2-filter', require(__dirname +'/post/reports-type-2-filter'));

/**
 * Отчет о результатах классификации
 */
router.post('/reports/reports-type-3-filter', require(__dirname +'/post/reports-type-3-filter'));

/**
 * Основная логика Сводного отчёта по требованиям
 */
router.post('/reports/reports-type-4-filter', require(__dirname +'/post/reports-type-4-filter'));


module.exports = router;