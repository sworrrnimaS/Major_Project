import nltk
import pandas as pd
from sklearn.cluster import KMeans
import numpy as np
from sentence_transformers import SentenceTransformer
from scipy.spatial import distance_matrix

# Download necessary NLTK resources
# nltk.download('punkt')
# nltk.download('punkt_tab')

# Initialize the model
model = SentenceTransformer('stsb-roberta-base')

def summarize_responses(article: str,num_cluster:int=10)->str:
# Sample Article (fill this with the article you want to summarize)

    # Convert the article to list of sentences
    sentences = nltk.sent_tokenize(article)
    sentences = [sentence.strip() for sentence in sentences]

    # Using Pandas to efficiently apply various transformations
    data = pd.DataFrame(sentences, columns=['sentence'])

    # Convert sentences to contextual dense vectors
    def get_sentence_embeddings(sentence):
        embedding = model.encode([sentence])
        return embedding[0]

    data['embeddings'] = data['sentence'].apply(get_sentence_embeddings)

    # Apply KMeans clustering on embeddings
    NUM_CLUSTERS = 10
    X = np.array(data['embeddings'].tolist())

    # Initialize KMeans from sklearn
    kmeans = KMeans(n_clusters=NUM_CLUSTERS, random_state=42)
    assigned_clusters = kmeans.fit_predict(X)

    # Add cluster and centroid information to the dataframe
    data['cluster'] = assigned_clusters
    data['centroid'] = data['cluster'].apply(lambda x: kmeans.cluster_centers_[x])

    # Compute distance from centroid
    def distance_from_centroid(row):
        return distance_matrix([row['embeddings']], [row['centroid']])[0][0]

    data['distance_from_centroid'] = data.apply(distance_from_centroid, axis=1)

    # Generate Summary by picking the sentence closest to the centroid in each cluster
    summary = ' '.join(data.sort_values('distance_from_centroid', ascending=True)
                    .groupby('cluster').head(1)
                    .sort_index()['sentence'].tolist())

    return(summary)
