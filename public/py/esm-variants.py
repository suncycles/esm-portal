
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from zipfile import ZipFile
import io
from js import fetch
import pandas as pd
from pyweb import pydom
from pyodide.http import open_url
from pyscript import display
from js import console
from urllib.request import urlopen

clinvar = 'https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/clinvar.csv.gz'
iso = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/isoform_list.csv'
llr = 'https://media.githubusercontent.com/media/suncycles/esm-portal/main/public/files/ALL_hum_isoforms_ESM1b_LLR.zip'

df=pd.read_csv(open_url(iso),index_col=0)
uids=list(df.index.values)
clinvar = pd.read_csv(open_url(clinvar))
url = urlopen(llr)

with ZipFile(io.BytesIO(url.read())) as my_zip_file:
    for contained_file in my_zip_file.namelist():
        # with open(("unzipped_and_read_" + contained_file + ".file"), "wb") as output:
        for line in my_zip_file.open(contained_file).readlines():
            print(line)

def load_LLR(uniprot_id):
  '''Loads the LLRs for a given uniprot id. Returns a 20xL dataframe 
     rows are indexed by AA change, 
     (AAorder=['K','R','H','E','D','N','Q','T','S','C','G','A','V','L','I','M','P','Y','F','W'])
     columns indexed by WT_AA+position e.g, "G 12"
     Usage example: load_LLR('P01116') or load_LLR('P01116-2')'''
  with ZipFile(open_url(llr)) as myzip:
    data = myzip.open(myzip.namelist()[0]+uniprot_id+'_LLR.csv')
  return pd.read_csv(data,index_col=0)

def meltLLR(LLR, gene_prefix=None, ignore_pos=False):
    vars = LLR.melt(ignore_index=False)
    vars['variant'] = [''.join(i.split(' ')) + j for i, j in zip(vars['variable'], vars.index)]
    vars['score'] = vars['value']
    vars = vars.set_index('variant')
    if not ignore_pos:
        vars['pos'] = [int(i[1:-1]) for i in vars.index]
    del vars['variable'], vars['value']
    if gene_prefix is not None:
        vars.index = gene_prefix + '_' + vars.index
    return vars

def plot_interactive(uniprot_id, show_clinvar=False):
    # primaryLLR = load_LLR(uniprot_id)
    primaryLLR = pd.read_csv(open_url('https://raw.githubusercontent.com/suncycles/esm-portal/main/public/files/A2RU49_LLR.csv'))

    fig, ax = plt.subplots(figsize=(14, 8))
    sns.heatmap(primaryLLR.values, ax=ax, cmap='viridis_r', cbar_kws={'label': 'LLR'}, vmin=-20, vmax=0)
    ax.set_xticks(np.arange(primaryLLR.shape[1]) + 0.5)
    ax.set_yticks(np.arange(primaryLLR.shape[0]) + 0.5)
    ax.set_xticklabels(primaryLLR.columns, rotation=90)
    ax.set_yticklabels(primaryLLR.index)
    ax.set_xlabel('Protein sequence')
    ax.set_ylabel('Amino acid change')
    ax.set_title('Protein Visualization')
    
    if show_clinvar:
        iso_clinvar = clinvar[clinvar.LLR_file_id == uniprot_id]
        iso_clinvar = iso_clinvar[iso_clinvar.ClinicalSignificance.isin(['Benign', 'Pathogenic'])]
        b_mut = set(iso_clinvar[iso_clinvar.ClinicalSignificance == 'Benign'].variant.values)
        p_mut = set(iso_clinvar[iso_clinvar.ClinicalSignificance == 'Pathogenic'].variant.values)
        
        for i in primaryLLR.columns:
            for j in list(primaryLLR.index):
                mut = i[0] + i[2:] + j
                if mut in b_mut:
                    ax.plot(i, j, 'go', markersize=8)  # green circle for benign
                elif mut in p_mut:
                    ax.plot(i, j, 'ro', markersize=8)  # red circle for pathogenic
    
    plt.show()

plot_interactive('A2RU49',show_clinvar=False)