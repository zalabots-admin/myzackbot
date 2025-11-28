
import { uploadData, getUrl } from 'aws-amplify/storage';


export async function uploadDocument( oDocument:any, oFolder:string, oName:string ) {

    const result = await uploadData({
      path: oFolder + '/' + oName,
      data: oDocument,
      options: {
        contentType: oDocument.type,
      }
    }).result;

    return result.path.split( "/" )[1];

};


export function setDocumentUploadText ( oDocumentName:string ): Promise<string> {


  if ( oDocumentName === '' || oDocumentName === null || oDocumentName === undefined ) {
    return Promise.resolve( 'Drag & Drop or Click to Upload' );
  } else  {
    return Promise.resolve( 'File: ' + oDocumentName );
  }  

};


export async function getDocumentLink ( oDocumentSource:string, oDocumentData:any ) {

  if ( oDocumentSource === 'N/A' || oDocumentSource === '' ) {
    return 'N/A';
  } else {

   const linkToStorageFile = await getUrl({
      path: oDocumentSource + '/' + oDocumentData,
    });
    console.log('Link to Storage File: ', linkToStorageFile.url.href.toString())
    return linkToStorageFile.url.href.toString();
    //return `https://${oBucket}.s3.amazonaws.com/${oDocumentData}`;
  }

}