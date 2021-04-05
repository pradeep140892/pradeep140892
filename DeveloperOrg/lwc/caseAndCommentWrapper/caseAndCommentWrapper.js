import { LightningElement,api,wire,track } from 'lwc';
import getData from '@salesforce/apex/CaseAndCommentCTRL.getDataFromServer';
import insertCaseComments from '@salesforce/apex/CaseAndCommentCTRL.insertCaseComments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [    
    { label: 'CaseNumber', fieldName: 'caseurl',type:'url',
      typeAttributes: {
            label: {
                fieldName: 'caseNumber'
            },
            target : '_blank'
      }    
    },
    { label: 'Case Subject', fieldName: 'subject', wrapText:'true' },
    { label: 'Case Last Modified date', fieldName: 'lastmodifieddate' },
    { label: 'Status', fieldName: 'status' },
    { label: 'Add Case Comment', fieldName: 'cseComment', editable : 'true' },
];

export default class CaseAndCommentWrapper extends LightningElement {

    @api NoOfRecords;
    @track Cases;
    @track error; 
    columns = columns;
    
    @wire(getData, { count:'$NoOfRecords' })
    wiredCases({ error, data }) {
        if (data) {
            let baseurl = 'https://'+location.host+'/';
            console.log('baseurl',baseurl);
            const modifiedApexresp = data.map(function (ele){
                let obj = Object.assign({},ele);
                obj.caseurl=baseurl+ele.id;
                return obj;
            })
            this.Cases= modifiedApexresp;
            console.log('Cases',this.Cases);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.Cases = undefined;
        }
    }

    handleSave(event){
        const updatedFields = event.detail.draftValues;
        console.log('updatedFields',updatedFields);
        insertCaseComments({data: updatedFields})
        .then(result => {
            console.log(result);
            this.showToast('Success!',result,'success','pester');
            window.location.reload();
        })
        .catch(error => {
            this.error = error;
            this.showToast('Error!',error,'error','pester');
        });
    }

    showToast(title,message,variant,mode){
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant:variant,
            mode:mode
        });
        this.dispatchEvent(event);
    }
}