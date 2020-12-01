const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = class Sheet {
    constructor() {
        this.doc = new GoogleSpreadsheet(''); // Google Sheet URI in the brackets
    };

    async load() {
        await this.doc.useServiceAccountAuth(require('./credentials.json'));
        await this.doc.loadInfo(); 
    };

    async getRows(i) {
        const sheet = this.doc.sheetsByIndex[i];
        const rows = await sheet.getRows();
        return rows;
    };

    async addRows(rows, i) {
        const sheet = this.doc.sheetsByIndex[i];
        await sheet.addRows(rows); 
  };

    async deleteRow(rows) {
        await rows[1].delete();
    };

    async addSheet(title, headerValues) {
        await this.doc.addSheet({ title, headerValues });
        return this.doc.sheetsByIndex.length-1; 
    }
};
