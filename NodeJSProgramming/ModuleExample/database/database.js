/**
 * 데이터베이스 스키마 로딩
 * 기본 파일이며 개발자 수정이 필요 없는 부분..이라고 함
 * 
 * @date 2017-12-11
 * @author Emrys
 */

 var mongoose = require('mongoose');

 /* 데이터베이스 객체에 db, schema, model을 모두 추가 */
 var database = {};

 /* 초기화를 위해 호출하는 함수 */
database.init = function(app, config) {
    console.log('init() 호출');
    connect(app, config);
}

/* 데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가 */
function connect(app, config) {
    console.log('connect() 호출');
    /* 데이터베이스 연결: config 설정 사용 */
    mongoose.Promise = global.Promise; //mongoose의 Promise 객체는 global의 Promise 객체 사용
    mongoose.connect(congif.db_url);
    database.db = mongoose.connection;

    database.db.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.db.on('open', function() {
        console.log('데이터베이스에 연결되었습니다.: ' + config.db_url);
        /* config에 등록된 스키마 및 모델 객체 생성 */
        createSchema(app, config);
    });
    database.db.on('disconnected', connect);
}

/* config에 정의된 스키마 및 모델 객체 생성 */
function  createSchema(app, config) {
    var schemaLen = config.db_schemas.length;
    console.log('설정에 정의된 스키마 수: %d', schemaLen);

    for(var i=0; i<schemaLen; i++) {
        var curItem = config.db_schemas[i];
        
        /** 모듈 파일에서 모듈 불러온 후 createSchema() 함수 호출  */
        var curSchema = require(curItem.file).createSchema(mongoose);
        console.log('%s 모듈을 불러들인 후 스키마 정의', curItem.file);
        
        /** User 모델 정의 */
        var curModel = mongoose.model(curItem.collection, curSchema);
        console.log('%s 컬렉션을 위해 모델 정의', curItem.collection);

        /** database 객체에 속성으로 추가 */
        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log('스키마 [%s], 모델 [%s]이 database 객체의 속성으로 추가되었습니다.',curItem.schemaName, curItem.modelName);
    }

    app.set('database', database);
    console.log('database 객체가 app 객체의 속성으로 추가되었습니다.');
}